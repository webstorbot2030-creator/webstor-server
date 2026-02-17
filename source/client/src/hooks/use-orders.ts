import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { CreateOrderRequest, UpdateOrderRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMyOrders() {
  return useQuery({
    queryKey: [api.orders.listMyOrders.path],
    queryFn: async () => {
      const res = await fetch(api.orders.listMyOrders.path);
      if (res.status === 401) return []; // Handle unauthorized gracefully
      if (!res.ok) throw new Error("Failed to fetch my orders");
      return await res.json();
    },
  });
}

export function useAllOrders(status?: string) {
  return useQuery({
    queryKey: [api.orders.listAll.path, status],
    queryFn: async () => {
      let url = api.orders.listAll.path;
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateOrderRequest & { payWithBalance?: boolean }) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("يرجى تسجيل الدخول أولاً");
        const err = await res.json();
        throw new Error(err.message || "Failed to create order");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.listMyOrders.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateOrderRequest }) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.listAll.path] });
      toast({ title: "تم تحديث حالة الطلب" });
    },
  });
}
