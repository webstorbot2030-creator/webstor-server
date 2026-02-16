import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";
import type { User, ApiToken } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      apiUser?: User;
      apiToken?: ApiToken;
    }
  }
}

async function apiAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, message: "Missing or invalid authorization token" });
  }

  const token = authHeader.substring(7);
  const tokenRecord = await storage.getApiTokenByToken(token);

  if (!tokenRecord || !tokenRecord.isActive) {
    return res.status(401).json({ status: false, message: "Invalid or inactive API token" });
  }

  if (tokenRecord.ipWhitelist) {
    const allowedIps = tokenRecord.ipWhitelist.split(",").map(ip => ip.trim());
    const clientIp = req.ip || req.socket.remoteAddress || "";
    if (allowedIps.length > 0 && allowedIps[0] !== "" && !allowedIps.includes(clientIp)) {
      return res.status(403).json({ status: false, message: "IP address not authorized" });
    }
  }

  await storage.updateApiToken(tokenRecord.id, { lastUsedAt: new Date() });
  req.apiUser = tokenRecord.user as User;
  req.apiToken = tokenRecord;
  next();
}

export function registerExternalApi(app: Express) {
  app.post("/api/v1/balance", apiAuth, async (req: Request, res: Response) => {
    try {
      const user = req.apiUser!;
      res.json({
        status: true,
        balance: user.balance || 0,
        currency: "YER",
      });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.message });
    }
  });

  app.post("/api/v1/services", apiAuth, async (req: Request, res: Response) => {
    try {
      const allServices = await storage.getServices();
      const groups = await storage.getServiceGroups();
      const serviceList = allServices
        .filter((s: any) => s.active !== false)
        .map((s: any) => {
          const group = groups.find(g => g.id === s.serviceGroupId);
          return {
            ServiceApiID: s.id,
            ServiceName: s.name,
            ServiceGroup: group?.name || "",
            Price: s.price,
            Requires: group?.inputType === "auth"
              ? [{ fieldname: "email", required: true }, { fieldname: "password", required: true }]
              : [{ fieldname: "player_id", required: true }],
          };
        });
      res.json({ status: true, ServiceList: serviceList });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.message });
    }
  });

  app.post("/api/v1/order", apiAuth, async (req: Request, res: Response) => {
    try {
      const { service, reference, player_id, email, zone_id, server_name, mobile, webhookurl } = req.body;

      if (!service) {
        return res.status(400).json({ status: false, code: 400, message: "Service ID is required" });
      }

      const serviceRecord = await storage.getService(Number(service));
      if (!serviceRecord || !serviceRecord.active) {
        return res.status(404).json({ status: false, code: 404, message: "Service not found or inactive" });
      }

      const user = req.apiUser!;
      if ((user.balance || 0) < serviceRecord.price) {
        return res.status(400).json({ status: false, code: 402, message: "Insufficient balance" });
      }

      const userInputId = player_id || email || mobile || "";
      if (!userInputId) {
        return res.status(400).json({ status: false, code: 400, message: "Player ID or Email is required" });
      }

      const order = await storage.createOrder({
        userId: user.id,
        serviceId: serviceRecord.id,
        userInputId: userInputId + (zone_id ? `|zone:${zone_id}` : "") + (server_name ? `|server:${server_name}` : ""),
      });

      await storage.updateUserBalance(user.id, (user.balance || 0) - serviceRecord.price);

      res.json({
        status: true,
        code: 200,
        message: "Order placed successfully",
        orderId: order.id,
        reference: reference || "",
        cost: serviceRecord.price,
      });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.message });
    }
  });

  app.post("/api/v1/order-status", apiAuth, async (req: Request, res: Response) => {
    try {
      const { id, reference } = req.body;
      if (!id && !reference) {
        return res.status(400).json({ status: false, message: "Order ID or reference is required" });
      }

      const allOrders = await storage.getUserOrders(req.apiUser!.id);
      const order = allOrders.find(o => o.id === Number(id));
      if (!order) {
        return res.status(404).json({ status: false, message: "Order not found" });
      }

      const statusMap: Record<string, number> = {
        pending: 1,
        processing: 2,
        completed: 3,
        rejected: 4,
      };

      res.json({
        status: true,
        progress: statusMap[order.status] || 1,
        orderStatus: order.status,
        msg: order.status === "completed" ? "تم تنفيذ الطلب بنجاح"
          : order.status === "rejected" ? (order.rejectionReason || "تم رفض الطلب")
            : order.status === "processing" ? "جاري التنفيذ"
              : "في الانتظار",
      });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.message });
    }
  });

  app.post("/api/webhook/provider/:providerId", async (req: Request, res: Response) => {
    try {
      const providerId = Number(req.params.providerId);
      const provider = await storage.getApiProvider(providerId);
      if (!provider) {
        return res.status(404).json({ status: false, message: "Provider not found" });
      }

      const { order_id, status, message, reference } = req.body;

      await storage.createApiOrderLog({
        providerId,
        direction: "incoming",
        requestData: JSON.stringify(req.body),
        externalOrderId: order_id?.toString(),
        externalReference: reference,
        status: status || "received",
      });

      if (order_id || reference) {
        const logs = await storage.getApiOrderLogs(providerId);
        const matchingLog = logs.find(l =>
          l.externalOrderId === order_id?.toString() || l.externalReference === reference
        );

        if (matchingLog?.orderId) {
          const newStatus = status === "completed" || status === 3 ? "completed"
            : status === "rejected" || status === 4 || status === 5 ? "rejected"
              : undefined;

          if (newStatus) {
            await storage.updateOrderStatus(
              matchingLog.orderId,
              newStatus,
              newStatus === "rejected" ? (message || "Rejected by provider") : undefined
            );
          }
        }
      }

      res.json({ status: true, message: "Webhook received" });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.message });
    }
  });
}

export async function forwardOrderToProvider(orderId: number, serviceId: number, userInputId: string): Promise<{ success: boolean; message: string }> {
  try {
    const mappings = await storage.getApiServiceMappingByLocalService(serviceId);
    if (!mappings || mappings.length === 0) {
      return { success: false, message: "No active provider mapping found" };
    }

    const mapping = mappings[0];
    const provider = mapping.provider;
    if (!provider || !provider.isActive) {
      return { success: false, message: "Provider is not active" };
    }

    const parts = userInputId.split("|");
    const mainId = parts[0];
    const zoneId = parts.find(p => p.startsWith("zone:"))?.replace("zone:", "");
    const serverName = parts.find(p => p.startsWith("server:"))?.replace("server:", "");

    const formData = new URLSearchParams();
    formData.append("request", "neworder");
    formData.append("service", mapping.externalServiceId);
    formData.append("reference", orderId.toString());

    if (mainId.includes("@")) {
      formData.append("email", mainId);
    } else {
      formData.append("player_id", mainId);
    }
    if (zoneId) formData.append("zone_id", zoneId);
    if (serverName) formData.append("server_name", serverName);

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (provider.username && provider.password) {
      headers["Authorization"] = "Basic " + Buffer.from(`${provider.username}:${provider.password}`).toString("base64");
    } else if (provider.apiToken) {
      headers["Authorization"] = `Bearer ${provider.apiToken}`;
    }

    const log = await storage.createApiOrderLog({
      orderId,
      providerId: provider.id,
      direction: "outgoing",
      requestData: JSON.stringify(Object.fromEntries(formData)),
      status: "pending",
    });

    try {
      const response = await fetch(provider.baseUrl, {
        method: "POST",
        headers,
        body: formData,
      });
      const responseData = await response.json();

      await storage.updateApiOrderLog(log.id, {
        responseData: JSON.stringify(responseData),
        externalOrderId: responseData.orderId?.toString(),
        status: responseData.status ? "success" : "failed",
        errorMessage: responseData.status ? undefined : responseData.message,
      });

      return {
        success: responseData.status === true,
        message: responseData.message || (responseData.status ? "Order forwarded successfully" : "Provider returned error"),
      };
    } catch (fetchError: any) {
      await storage.updateApiOrderLog(log.id, {
        status: "error",
        errorMessage: fetchError.message,
      });
      return { success: false, message: `Connection error: ${fetchError.message}` };
    }
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export function generateApiToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
