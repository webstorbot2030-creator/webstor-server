import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogIn, UserPlus, KeyRound, ArrowRight, Mail, Phone, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  identifier: z.string().min(1, "البريد الإلكتروني أو رقم الهاتف مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = z.object({
  fullName: z.string().min(4, "الاسم الرباعي مطلوب"),
  phoneNumber: z.string().optional().or(z.literal("")),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
}).refine(data => (data.phoneNumber && data.phoneNumber.length >= 9) || (data.email && data.email.length > 0), {
  message: "يجب إدخال رقم الهاتف أو البريد الإلكتروني على الأقل",
  path: ["email"],
});

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showReset, setShowReset] = useState(false);
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", phoneNumber: "", email: "", password: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    login.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    register.mutate(data);
  };

  if (showReset) {
    return <PasswordResetFlow onBack={() => setShowReset(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 mb-4 transform rotate-3">
            <LogIn className="w-10 h-10 text-white transform -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ويب ستور</h1>
          <p className="text-gray-400">بوابتك للخدمات الرقمية</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl border-white/10">
          {settings?.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-center text-white mb-2">{settings?.storeName || "ويب ستور"}</h1>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 p-1 h-12 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary" data-testid="tab-login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-primary" data-testid="tab-register">إنشاء حساب</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني أو رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com أو 77xxxxxxx" {...field} className="bg-black/20 border-white/10 h-12 text-lg" dir="ltr" data-testid="input-login-identifier" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} className="bg-black/20 border-white/10 h-12" data-testid="input-login-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-4" disabled={login.isPending} data-testid="button-login">
                    {login.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                    دخول
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-sm text-blue-400 hover:text-blue-300" onClick={() => setShowReset(true)} data-testid="button-forgot-password">
                    <KeyRound className="w-4 h-4 ml-2" />
                    نسيت كلمة المرور؟
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الرباعي</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} className="bg-black/20 border-white/10 h-12" data-testid="input-register-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} className="bg-black/20 border-white/10 h-12" dir="ltr" data-testid="input-register-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center text-sm text-slate-400">أو</div>
                  <FormField
                    control={registerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="77xxxxxxx" {...field} className="bg-black/20 border-white/10 h-12" dir="ltr" data-testid="input-register-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} className="bg-black/20 border-white/10 h-12" data-testid="input-register-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-4" disabled={register.isPending} data-testid="button-register">
                    {register.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                    تسجيل حساب جديد
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function PasswordResetFlow({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"method" | "code" | "newPassword">("method");
  const [method, setMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [identifier, setIdentifier] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    if (!identifier) {
      toast({ title: "خطأ", description: method === "whatsapp" ? "أدخل رقم الهاتف" : "أدخل البريد الإلكتروني", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/password-reset/request", { identifier, method });
      const data = await res.json();
      if (data.success) {
        setUserId(data.userId);
        setStep("code");
        toast({ title: "تم الإرسال", description: "تم إرسال رمز التحقق بنجاح" });
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({ title: "خطأ", description: "أدخل رمز التحقق المكون من 6 أرقام", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/password-reset/verify", { userId, code });
      const data = await res.json();
      if (data.success) {
        setStep("newPassword");
        toast({ title: "تم التحقق", description: "رمز التحقق صحيح" });
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "رمز التحقق غير صحيح", variant: "destructive" });
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمة المرور غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/password-reset/reset", { userId, code, newPassword, confirmPassword });
      const data = await res.json();
      if (data.success) {
        toast({ title: "تم بنجاح", description: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن" });
        onBack();
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">استعادة كلمة المرور</h1>
          <p className="text-gray-400">
            {step === "method" && "اختر طريقة الاستعادة"}
            {step === "code" && "أدخل رمز التحقق"}
            {step === "newPassword" && "أدخل كلمة المرور الجديدة"}
          </p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl border-white/10">
          {step === "method" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button
                  type="button"
                  variant={method === "whatsapp" ? "default" : "outline"}
                  className={`h-16 rounded-xl flex flex-col gap-1 ${method === "whatsapp" ? "bg-green-600 hover:bg-green-700 border-green-600" : "border-white/10 text-slate-300"}`}
                  onClick={() => setMethod("whatsapp")}
                  data-testid="button-method-whatsapp"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs">واتساب</span>
                </Button>
                <Button
                  type="button"
                  variant={method === "email" ? "default" : "outline"}
                  className={`h-16 rounded-xl flex flex-col gap-1 ${method === "email" ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : "border-white/10 text-slate-300"}`}
                  onClick={() => setMethod("email")}
                  data-testid="button-method-email"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">بريد إلكتروني</span>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  {method === "whatsapp" ? "رقم الهاتف" : "البريد الإلكتروني"}
                </label>
                <Input
                  placeholder={method === "whatsapp" ? "77xxxxxxx" : "email@example.com"}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="bg-black/20 border-white/10 h-12 text-lg"
                  dir="ltr"
                  data-testid="input-reset-identifier"
                />
              </div>

              <Button onClick={requestCode} disabled={loading} className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-2" data-testid="button-send-code">
                {loading ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : null}
                إرسال رمز التحقق
              </Button>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">رمز التحقق (6 أرقام)</label>
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-black/20 border-white/10 h-14 text-2xl text-center tracking-[0.5em] font-mono"
                  dir="ltr"
                  maxLength={6}
                  data-testid="input-reset-code"
                />
                <p className="text-[11px] text-slate-500 text-center mt-1">
                  تم إرسال رمز التحقق إلى {method === "whatsapp" ? "واتساب" : "بريدك الإلكتروني"}
                </p>
              </div>

              <Button onClick={verifyCode} disabled={loading} className="w-full h-12 text-lg bg-primary hover:bg-primary/90" data-testid="button-verify-code">
                {loading ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : null}
                تأكيد الرمز
              </Button>
            </div>
          )}

          {step === "newPassword" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bg-black/20 border-white/10 h-12"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-black/20 border-white/10 h-12"
                  data-testid="input-confirm-password"
                />
              </div>

              <Button onClick={resetPassword} disabled={loading} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" data-testid="button-reset-password">
                {loading ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : null}
                تغيير كلمة المرور
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full mt-4 text-sm text-slate-400 hover:text-white" onClick={step === "method" ? onBack : () => setStep("method")} data-testid="button-back">
            <ArrowRight className="w-4 h-4 ml-2" />
            {step === "method" ? "العودة لتسجيل الدخول" : "رجوع"}
          </Button>
        </div>
      </div>
    </div>
  );
}
