import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock, Phone, Mail, Calendar, Shield, Loader2, ArrowRight, Wallet } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) setLocation("/auth");
  }, [user, setLocation]);

  if (!user) return null;

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/change-password", { currentPassword, newPassword, confirmPassword });
      const data = await res.json();
      if (data.success) {
        toast({ title: "تم بنجاح", description: "تم تغيير كلمة المرور" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">الملف الشخصي</h1>
        </div>

        <Card className="bg-slate-900/80 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-primary" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> الاسم الكامل
                </label>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-white" data-testid="text-profile-name">
                  {user.fullName}
                </div>
              </div>

              {user.phoneNumber && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> رقم الهاتف
                  </label>
                  <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-white font-mono" dir="ltr" data-testid="text-profile-phone">
                    {user.phoneNumber}
                  </div>
                </div>
              )}

              {(user as any).email && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> البريد الإلكتروني
                  </label>
                  <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-white" dir="ltr" data-testid="text-profile-email">
                    {(user as any).email}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> الرصيد
                </label>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-primary font-bold" data-testid="text-profile-balance">
                  {(user.balance || 0).toLocaleString()} ر.ي
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> نوع الحساب
                </label>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-white" data-testid="text-profile-role">
                  {user.role === "admin" ? "مدير" : "مستخدم"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> تاريخ التسجيل
                </label>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-white" data-testid="text-profile-date">
                  {user.createdAt ? format(new Date(user.createdAt), "yyyy/MM/dd") : "غير محدد"}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              * لا يمكن تغيير الاسم أو رقم الهاتف أو البريد الإلكتروني لحماية حسابك
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="w-5 h-5 text-orange-400" />
              تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">كلمة المرور الحالية</label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">كلمة المرور الجديدة</label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-profile-new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">تأكيد كلمة المرور الجديدة</label>
              <Input
                type="password"
                placeholder="أعد كتابة كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-profile-confirm-password"
              />
            </div>
            <Button onClick={changePassword} disabled={loading} className="w-full h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold" data-testid="button-change-password">
              {loading ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
