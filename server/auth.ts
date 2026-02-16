import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r8q/+&1LM3)CD*zAGpx1xm{NeQHc;#",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "identifier" }, async (identifier, password, done) => {
      let user;
      if (identifier.includes("@")) {
        user = await storage.getUserByEmail(identifier);
      } else {
        user = await storage.getUserByPhoneNumber(identifier);
      }
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      if (!user.active) {
        return done(null, false);
      }
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { fullName, phoneNumber, email, password } = req.body;

      if (!phoneNumber && !email) {
        return res.status(400).json({ message: "يجب إدخال رقم الهاتف أو البريد الإلكتروني" });
      }

      if (!fullName || !password) {
        return res.status(400).json({ message: "الاسم وكلمة المرور مطلوبان" });
      }

      if (phoneNumber) {
        const existingPhone = await storage.getUserByPhoneNumber(phoneNumber);
        if (existingPhone) {
          return res.status(400).json({ message: "رقم الهاتف مسجل مسبقاً" });
        }
      }

      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقاً" });
        }
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        fullName,
        phoneNumber: phoneNumber || null,
        email: email || null,
        password: hashedPassword,
        role: "user",
        active: false,
      });

      try {
        const allUsers = await storage.getAllUsers();
        const admins = allUsers.filter(u => u.role === "admin");
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "info",
            title: "حساب جديد بانتظار التفعيل",
            message: `المستخدم ${fullName} (${phoneNumber || email}) سجل حساب جديد ويحتاج موافقة للتفعيل`,
          });
        }
      } catch (e) {
        console.error("Failed to notify admins about new registration:", e);
      }

      res.status(201).json({ ...user, needsApproval: true });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      let user;
      if (identifier?.includes("@")) {
        user = await storage.getUserByEmail(identifier);
      } else {
        user = await storage.getUserByPhoneNumber(identifier);
      }
      if (!user) {
        return res.status(401).json({ message: "البريد/رقم الهاتف أو كلمة المرور غير صحيحة" });
      }
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "البريد/رقم الهاتف أو كلمة المرور غير صحيحة" });
      }
      if (!user.active) {
        return res.status(403).json({ message: "حسابك بانتظار موافقة الإدارة. يرجى الانتظار حتى يتم تفعيل حسابك." });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { identifier, method } = req.body;
      if (!identifier || !method) {
        return res.status(400).json({ message: "البيانات مطلوبة" });
      }

      let user;
      if (method === "whatsapp") {
        user = await storage.getUserByPhoneNumber(identifier);
      } else if (method === "email") {
        user = await storage.getUserByEmail(identifier);
      }

      if (!user) {
        return res.status(404).json({ message: "لم يتم العثور على حساب بهذه البيانات" });
      }

      const code = generateResetCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createPasswordResetCode({
        userId: user.id,
        code,
        method,
        expiresAt,
        used: false,
      });

      if (method === "whatsapp") {
        const settings = await storage.getSettings();
        const adminWhatsapp = settings?.adminWhatsapp || "";
        console.log(`[Password Reset] Code ${code} for user ${user.phoneNumber} via WhatsApp`);

        try {
          const allUsers = await storage.getAllUsers();
          const admins = allUsers.filter(u => u.role === "admin");
          for (const admin of admins) {
            await storage.createNotification({
              userId: admin.id,
              type: "info",
              title: "طلب استعادة كلمة مرور",
              message: `المستخدم ${user.fullName} (${user.phoneNumber}) طلب استعادة كلمة المرور. رمز التحقق: ${code}`,
            });
          }
        } catch (e) {
          console.error("Failed to notify admin:", e);
        }
      } else if (method === "email") {
        console.log(`[Password Reset] Code ${code} for user ${user.email} via Email`);

        try {
          const allUsers = await storage.getAllUsers();
          const admins = allUsers.filter(u => u.role === "admin");
          for (const admin of admins) {
            await storage.createNotification({
              userId: admin.id,
              type: "info",
              title: "طلب استعادة كلمة مرور",
              message: `المستخدم ${user.fullName} (${user.email}) طلب استعادة كلمة المرور. رمز التحقق: ${code}`,
            });
          }
        } catch (e) {
          console.error("Failed to notify admin:", e);
        }
      }

      res.json({ success: true, userId: user.id, message: "تم إرسال رمز التحقق" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/password-reset/verify", async (req, res) => {
    try {
      const { userId, code } = req.body;
      if (!userId || !code) {
        return res.status(400).json({ message: "البيانات مطلوبة" });
      }

      const resetCode = await storage.getValidResetCode(userId, code);
      if (!resetCode) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }

      res.json({ success: true, message: "رمز التحقق صحيح" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/password-reset/reset", async (req, res) => {
    try {
      const { userId, code, newPassword, confirmPassword } = req.body;
      if (!userId || !code || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "كلمة المرور الجديدة غير متطابقة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const resetCode = await storage.getValidResetCode(userId, code);
      if (!resetCode) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);
      await storage.markResetCodeUsed(resetCode.id);

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "كلمة المرور الجديدة غير متطابقة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
}
