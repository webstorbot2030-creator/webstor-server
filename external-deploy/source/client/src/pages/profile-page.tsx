import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Phone, Mail, Calendar, Shield, Loader2, ArrowRight, Wallet, Upload, ImageIcon, RefreshCw, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<any[]>({
    queryKey: ["/api/deposit-requests"],
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; receiptUrl: string }) => {
      const res = await apiRequest("POST", "/api/deposit-requests", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "تم إرسال طلب الشحن بنجاح" });
      setDepositAmount("");
      setReceiptUrl("");
      qc.invalidateQueries({ queryKey: ["/api/deposit-requests"] });
      qc.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل إرسال الطلب", variant: "destructive" });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      const data = await res.json();
      setReceiptUrl(data.url);
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
    }
    setUploading(false);
  };

  const submitDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({ title: "خطأ", description: "أدخل مبلغ صحيح", variant: "destructive" });
      return;
    }
    if (!receiptUrl) {
      toast({ title: "خطأ", description: "يرجى رفع صورة الإيصال", variant: "destructive" });
      return;
    }
    depositMutation.mutate({ amount, receiptUrl });
  };

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
      const res = await apiRequest("POST", "/api/change-password", { currentPassword, newPassword });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "فشل تغيير كلمة المرور", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" className="dark:text-slate-400 text-gray-500 dark:hover:text-white hover:text-gray-900" onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">الملف الشخصي</h1>
        </div>

        <Card className="dark:bg-slate-900/80 bg-white/90 dark:border-white/5 border-gray-200 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white text-gray-900">
              <User className="w-5 h-5 text-primary" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> الاسم الكامل
                </label>
                <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 dark:text-white text-gray-900" data-testid="text-profile-name">
                  {user.fullName}
                </div>
              </div>

              {user.phoneNumber && (
                <div className="space-y-2">
                  <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> رقم الهاتف
                  </label>
                  <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 dark:text-white text-gray-900 font-mono" dir="ltr" data-testid="text-profile-phone">
                    {user.phoneNumber}
                  </div>
                </div>
              )}

              {(user as any).email && (
                <div className="space-y-2">
                  <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> البريد الإلكتروني
                  </label>
                  <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 dark:text-white text-gray-900" dir="ltr" data-testid="text-profile-email">
                    {(user as any).email}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> الرصيد
                </label>
                <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 text-primary font-bold" data-testid="text-profile-balance">
                  {(user.balance || 0).toLocaleString()} ر.ي
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> نوع الحساب
                </label>
                <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 dark:text-white text-gray-900" data-testid="text-profile-role">
                  {user.role === "admin" ? "مدير" : "مستخدم"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs dark:text-slate-400 text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> تاريخ التسجيل
                </label>
                <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 dark:text-white text-gray-900" data-testid="text-profile-date">
                  {user.createdAt ? format(new Date(user.createdAt), "yyyy/MM/dd") : "غير محدد"}
                </div>
              </div>
            </div>

            <p className="text-[11px] dark:text-slate-500 text-gray-400 mt-2">
              * لا يمكن تغيير الاسم أو رقم الهاتف أو البريد الإلكتروني لحماية حسابك
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900/80 bg-white/90 dark:border-white/5 border-gray-200 backdrop-blur-sm shadow-sm" dir="rtl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white text-gray-900">
              <Wallet className="w-5 h-5 text-green-500 dark:text-green-400" />
              طلب شحن رصيد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs dark:text-slate-400 text-gray-500 mb-1">رصيدك الحالي</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-deposit-balance">
                {(user.balance || 0).toLocaleString()} ر.ي
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs dark:text-slate-400 text-gray-500">المبلغ المطلوب</label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="dark:bg-black/20 bg-gray-50 dark:border-white/10 border-gray-200 h-12"
                data-testid="input-deposit-amount"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs dark:text-slate-400 text-gray-500">صورة الإيصال</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                data-testid="input-receipt-file"
              />
              <Button
                variant="outline"
                className="w-full h-12 dark:border-white/10 border-gray-200 dark:text-slate-300 text-gray-600"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                data-testid="button-upload-receipt"
              >
                {uploading ? <Loader2 className="animate-spin w-4 h-4 ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                {receiptUrl ? "تم الرفع - اضغط لتغيير" : "رفع صورة الإيصال"}
              </Button>
              {receiptUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border dark:border-white/5 border-gray-200">
                  <img src={receiptUrl} alt="إيصال" className="w-full max-h-48 object-contain dark:bg-black/20 bg-gray-50" data-testid="img-receipt-preview" />
                </div>
              )}
            </div>

            <Button
              onClick={submitDeposit}
              disabled={depositMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white"
              data-testid="button-submit-deposit"
            >
              {depositMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : <Wallet className="w-4 h-4 ml-2" />}
              إرسال طلب الشحن
            </Button>

            {depositsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 dark:text-slate-400 text-gray-400" /></div>
            ) : deposits.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-semibold dark:text-slate-300 text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> طلبات الشحن السابقة
                </h3>
                {deposits.map((d: any) => (
                  <div key={d.id} className="dark:bg-black/30 bg-gray-50 border dark:border-white/5 border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap" data-testid={`deposit-request-${d.id}`}>
                    <div className="space-y-1">
                      <p className="dark:text-white text-gray-900 text-sm font-medium">{Number(d.amount).toLocaleString()} ر.ي</p>
                      {d.approvedAmount && <p className="text-xs text-green-500 dark:text-green-400">المبلغ المعتمد: {Number(d.approvedAmount).toLocaleString()} ر.ي</p>}
                      {d.rejectionReason && <p className="text-xs text-red-500 dark:text-red-400">السبب: {d.rejectionReason}</p>}
                      {d.createdAt && <p className="text-[10px] dark:text-slate-500 text-gray-400">{format(new Date(d.createdAt), "yyyy/MM/dd HH:mm")}</p>}
                    </div>
                    <Badge
                      className={
                        d.status === "approved" ? "bg-green-600/20 text-green-600 dark:text-green-400 border-green-600/30" :
                        d.status === "rejected" ? "bg-red-600/20 text-red-600 dark:text-red-400 border-red-600/30" :
                        "bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600/30"
                      }
                      data-testid={`badge-status-${d.id}`}
                    >
                      {d.status === "approved" ? "مقبول" : d.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900/80 bg-white/90 dark:border-white/5 border-gray-200 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white text-gray-900">
              <Lock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs dark:text-slate-400 text-gray-500">كلمة المرور الحالية</label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="dark:bg-black/20 bg-gray-50 dark:border-white/10 border-gray-200 h-12"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs dark:text-slate-400 text-gray-500">كلمة المرور الجديدة</label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="dark:bg-black/20 bg-gray-50 dark:border-white/10 border-gray-200 h-12"
                data-testid="input-profile-new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs dark:text-slate-400 text-gray-500">تأكيد كلمة المرور الجديدة</label>
              <Input
                type="password"
                placeholder="أعد كتابة كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="dark:bg-black/20 bg-gray-50 dark:border-white/10 border-gray-200 h-12"
                data-testid="input-profile-confirm-password"
              />
            </div>
            <Button onClick={changePassword} disabled={loading} className="w-full h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold text-white" data-testid="button-change-password">
              {loading ? <Loader2 className="animate-spin w-5 h-5 ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}