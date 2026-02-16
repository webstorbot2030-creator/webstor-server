import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useEffect } from "react";

const loginSchema = z.object({
  phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = z.object({
  fullName: z.string().min(4, "الاسم الرباعي مطلوب"),
  phoneNumber: z.string().min(9, "رقم الهاتف يجب أن يكون 9 أرقام على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", phoneNumber: "", password: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    login.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    register.mutate(data);
  };

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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 p-1 h-12 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-primary">إنشاء حساب</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="77xxxxxxx" {...field} className="bg-black/20 border-white/10 h-12 text-lg" dir="ltr" />
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
                          <Input type="password" placeholder="••••••" {...field} className="bg-black/20 border-white/10 h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-4" disabled={login.isPending}>
                    {login.isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                    دخول
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
                          <Input placeholder="الاسم الكامل" {...field} className="bg-black/20 border-white/10 h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="77xxxxxxx" {...field} className="bg-black/20 border-white/10 h-12" dir="ltr" />
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
                          <Input type="password" placeholder="••••••" {...field} className="bg-black/20 border-white/10 h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-4" disabled={register.isPending}>
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
