import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useCategories, useCreateCategory, useDeleteCategory, useServices, useCreateService, useDeleteService, useAds, useCreateAd, useDeleteAd, useBanks, useCreateBank, useDeleteBank, useSettings, useUpdateSettings, useServiceGroups, useCreateServiceGroup, useDeleteServiceGroup, useAdminUsers, useUpdateUser, useUpdateServiceGroup, useUpdateService } from "@/hooks/use-store";
import { Loader2, Trash2, Plus, Check, X, LayoutDashboard, ShoppingBag, Package, ListTree, Megaphone, Landmark, Settings, ExternalLink, ShieldAlert, Users, Power, Image, Link, Eye, EyeOff, UserCog, Wallet, BarChart3, Download, Filter, TrendingUp, Clock, UserPlus, DollarSign, Activity, KeyRound, Lock, Mail, MessageCircle, Crown, Upload, ImageIcon, Wrench, Pencil, RotateCcw, HardDrive, Calendar, FileDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 rtl dark" dir="rtl">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-slate-900 border-l border-white/5 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/accounting")} variant="ghost" className="justify-start gap-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl h-12" data-testid="link-accounting">
              <Wallet className="w-5 h-5" />
              <span>النظام المحاسبي</span>
            </Button>
            <Button onClick={() => setLocation("/api-integration")} variant="ghost" className="justify-start gap-3 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-xl h-12" data-testid="link-api-integration">
              <ExternalLink className="w-5 h-5" />
              <span>ربط API</span>
            </Button>
            <Button onClick={() => setLocation("/")} variant="ghost" className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12">
              <ExternalLink className="w-5 h-5" />
              <span>العودة للمتجر</span>
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <DashboardStats />

            <Tabs defaultValue="orders" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">مرحباً، {user.fullName}</h2>
                  <p className="text-slate-400">إليك نظرة عامة على متجرك اليوم</p>
                </div>
                
                <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-2xl h-auto flex-wrap gap-1">
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <ShoppingBag className="w-4 h-4" />
                    <span>الطلبات</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Users className="w-4 h-4" />
                    <span>المستخدمين</span>
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <ListTree className="w-4 h-4" />
                    <span>الخدمات</span>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>الأقسام</span>
                  </TabsTrigger>
                  <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Megaphone className="w-4 h-4" />
                    <span>الإعلانات</span>
                  </TabsTrigger>
                  <TabsTrigger value="banks" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Landmark className="w-4 h-4" />
                    <span>البنوك</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Settings className="w-4 h-4" />
                    <span>الإعدادات</span>
                  </TabsTrigger>
                  <TabsTrigger value="deposits" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Wallet className="w-4 h-4" />
                    <span>طلبات التغذية</span>
                  </TabsTrigger>
                  <TabsTrigger value="vip" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Crown className="w-4 h-4" />
                    <span>مجموعات VIP</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <BarChart3 className="w-4 h-4" />
                    <span>التقارير</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Activity className="w-4 h-4" />
                    <span>السجل</span>
                  </TabsTrigger>
                  <TabsTrigger value="backups" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <HardDrive className="w-4 h-4" />
                    <span>النسخ الاحتياطي</span>
                  </TabsTrigger>
                  <TabsTrigger value="myaccount" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs">
                    <Lock className="w-4 h-4" />
                    <span>حسابي</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="orders" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <OrdersManager />
              </TabsContent>
              <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <UsersManager />
              </TabsContent>
              <TabsContent value="groups" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <ServiceGroupsManager />
              </TabsContent>
              <TabsContent value="categories" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <CategoriesManager />
              </TabsContent>
              <TabsContent value="ads" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AdsManager />
              </TabsContent>
              <TabsContent value="banks" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <BanksManager />
              </TabsContent>
              <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <StoreSettingsManager />
              </TabsContent>
              <TabsContent value="deposits" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <DepositRequestsManager />
              </TabsContent>
              <TabsContent value="vip" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <VipGroupsManager />
              </TabsContent>
              <TabsContent value="reports" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <OrderReportsManager />
              </TabsContent>
              <TabsContent value="activity" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AdminActivityLogsManager />
              </TabsContent>
              <TabsContent value="backups" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <BackupManager />
              </TabsContent>
              <TabsContent value="myaccount" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AdminAccountManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function OrdersManager() {
  const [filter, setFilter] = useState('all');
  const { data: orders, isLoading } = useAllOrders(filter);
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const handleStatus = (id: number, status: string, reason?: string) => {
    updateStatus({ id, data: { status, rejectionReason: reason } });
    if (status === 'rejected') { setRejectId(null); setReason(""); }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'pending', label: 'قيد الانتظار' },
          { id: 'processing', label: 'قيد التنفيذ' },
          { id: 'completed', label: 'مكتمل' },
          { id: 'rejected', label: 'مرفوض' }
        ].map(s => (
          <Button key={s.id} variant={filter === s.id ? 'default' : 'outline'} onClick={() => setFilter(s.id)}
            className={`rounded-xl px-6 h-11 transition-all ${filter === s.id ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
          >{s.label}</Button>
        ))}
      </div>
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : orders?.length === 0 ? (
          <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد طلبات في هذا القسم حالياً</p>
          </Card>
        ) : orders?.map(order => (
          <Card key={order.id} className="bg-slate-900 border-white/5 overflow-hidden transition-all hover:border-primary/30">
            <CardContent className="p-0">
              <div className="p-5 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                    {order.service.image || '💎'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-white">{order.service.name}</h3>
                      <span className="text-[10px] font-mono bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">#{order.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> {order.user.fullName}</span>
                      <span className="font-mono text-teal-400">ID: {order.userInputId}</span>
                      <span>{format(new Date(order.createdAt!), "yyyy/MM/dd HH:mm")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : order.status === 'processing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : order.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'processing' ? 'قيد التنفيذ' : order.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'completed' && order.status !== 'rejected' && (
                       <>
                         {order.status === 'pending' && (
                           <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-xl" onClick={() => handleStatus(order.id, 'processing')}>بدء التنفيذ</Button>
                         )}
                         <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-4 rounded-xl" onClick={() => handleStatus(order.id, 'completed')}><Check className="w-4 h-4 ml-1" /> إكمال</Button>
                         <Dialog open={rejectId === order.id} onOpenChange={(open) => !open && setRejectId(null)}>
                           <DialogTrigger asChild>
                             <Button size="sm" variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => setRejectId(order.id)}><X className="w-4 h-4 ml-1" /> رفض</Button>
                           </DialogTrigger>
                           <DialogContent className="bg-slate-900 border-white/10 text-white">
                             <DialogHeader><DialogTitle>سبب الرفض</DialogTitle></DialogHeader>
                             <div className="space-y-4 py-4">
                               <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="اكتب سبب الرفض هنا..." className="bg-black/20 border-white/10 h-12" />
                               <Button className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-xl" onClick={() => handleStatus(order.id, 'rejected', reason)}>تأكيد الرفض</Button>
                             </div>
                           </DialogContent>
                         </Dialog>
                       </>
                    )}
                    {(order.status === 'completed' || order.status === 'rejected') && (
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-9 px-4 rounded-xl" onClick={() => handleStatus(order.id, 'pending')} data-testid={`button-reset-order-${order.id}`}>
                        <RotateCcw className="w-4 h-4 ml-1" /> إعادة للمعالجة
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DepositRequestsManager() {
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [selectedFundId, setSelectedFundId] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: deposits, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/deposit-requests"],
  });

  const { data: funds } = useQuery<any[]>({
    queryKey: ["/api/accounting/funds"],
  });

  const filteredDeposits = useMemo(() => {
    if (!deposits) return [];
    if (filter === 'all') return deposits;
    return deposits.filter((d: any) => d.status === filter);
  }, [deposits, filter]);

  const handleApprove = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/deposit-requests/${id}`, {
        status: "approved",
        approvedAmount: Number(approvedAmount),
        fundId: selectedFundId ? Number(selectedFundId) : undefined,
        notes,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposit-requests"] });
      toast({ title: "تم قبول طلب التغذية بنجاح" });
      setSelectedRequest(null);
      setApprovedAmount("");
      setSelectedFundId("");
      setNotes("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/deposit-requests/${id}`, {
        status: "rejected",
        rejectionReason,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposit-requests"] });
      toast({ title: "تم رفض الطلب" });
      setRejectingId(null);
      setRejectionReason("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'pending', label: 'قيد الانتظار' },
          { id: 'approved', label: 'مقبول' },
          { id: 'rejected', label: 'مرفوض' }
        ].map(s => (
          <Button key={s.id} variant={filter === s.id ? 'default' : 'outline'} onClick={() => setFilter(s.id)}
            className={`rounded-xl px-6 h-11 transition-all ${filter === s.id ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
            data-testid={`button-deposit-filter-${s.id}`}
          >{s.label}</Button>
        ))}
      </div>
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : filteredDeposits.length === 0 ? (
          <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
            <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد طلبات تغذية في هذا القسم</p>
          </Card>
        ) : filteredDeposits.map((req: any) => (
          <Card key={req.id} className="bg-slate-900 border-white/5 overflow-hidden transition-all hover:border-primary/30" data-testid={`card-deposit-${req.id}`}>
            <CardContent className="p-0">
              <div className="p-5 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                <div className="flex gap-4 items-start">
                  {req.receiptImageUrl && (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5 cursor-pointer" onClick={() => setViewImage(req.receiptImageUrl)} data-testid={`button-view-receipt-${req.id}`}>
                      <img src={req.receiptImageUrl} alt="إيصال" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-white">{req.user?.fullName || 'مستخدم'}</h3>
                      <span className="text-[10px] font-mono bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">#{req.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span className="font-bold text-teal-400">{Number(req.amount || 0).toLocaleString()} ر.ي</span>
                      {req.createdAt && <span>{format(new Date(req.createdAt), "yyyy/MM/dd HH:mm")}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${req.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : req.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'approved' ? 'مقبول' : 'مرفوض'}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <Dialog open={selectedRequest === req.id} onOpenChange={open => { if (!open) setSelectedRequest(null); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-4 rounded-xl" onClick={() => { setSelectedRequest(req.id); setApprovedAmount(String(req.amount || 0)); }} data-testid={`button-approve-deposit-${req.id}`}>
                            <Check className="w-4 h-4 ml-1" /> قبول
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                          <DialogHeader><DialogTitle>قبول طلب التغذية</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm text-slate-400">المبلغ المعتمد</label>
                              <Input value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} type="number" className="bg-black/20 border-white/10 h-12 text-center text-xl font-mono" data-testid="input-approved-amount" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-slate-400">الصندوق</label>
                              <select value={selectedFundId} onChange={e => setSelectedFundId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none" data-testid="select-deposit-fund">
                                <option value="" className="bg-slate-900">اختر الصندوق</option>
                                {funds?.map((f: any) => <option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-slate-400">ملاحظات (اختياري)</label>
                              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none min-h-[80px] resize-none" data-testid="input-deposit-notes" />
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl" onClick={() => handleApprove(req.id)} data-testid="button-confirm-approve">تأكيد القبول</Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={rejectingId === req.id} onOpenChange={open => { if (!open) setRejectingId(null); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => setRejectingId(req.id)} data-testid={`button-reject-deposit-${req.id}`}>
                            <X className="w-4 h-4 ml-1" /> رفض
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                          <DialogHeader><DialogTitle>سبب الرفض</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="اكتب سبب الرفض هنا..." className="bg-black/20 border-white/10 h-12" data-testid="input-rejection-reason" />
                            <Button className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-xl" onClick={() => handleReject(req.id)} data-testid="button-confirm-reject">تأكيد الرفض</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!viewImage} onOpenChange={open => { if (!open) setViewImage(null); }}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader><DialogTitle>صورة الإيصال</DialogTitle></DialogHeader>
          {viewImage && <img src={viewImage} alt="إيصال" className="w-full rounded-xl" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VipGroupsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDiscount, setNewGroupDiscount] = useState("");
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editDiscount, setEditDiscount] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [newDiscountServiceId, setNewDiscountServiceId] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState("");

  const { data: vipGroups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/vip-groups"],
  });

  const { data: services } = useServices();

  const handleCreateGroup = async () => {
    try {
      await apiRequest("POST", "/api/vip-groups", {
        name: newGroupName,
        globalDiscount: Number(newGroupDiscount),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups"] });
      toast({ title: "تم إضافة مجموعة VIP بنجاح" });
      setShowAddDialog(false);
      setNewGroupName("");
      setNewGroupDiscount("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleUpdateGroup = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/vip-groups/${id}`, {
        globalDiscount: Number(editDiscount),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups"] });
      toast({ title: "تم التحديث" });
      setEditingGroup(null);
      setEditDiscount("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/vip-groups/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups"] });
      toast({ title: "تم حذف المجموعة" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleAddDiscount = async (groupId: number) => {
    try {
      await apiRequest("POST", `/api/vip-groups/${groupId}/discounts`, {
        serviceId: Number(newDiscountServiceId),
        discountPercent: Number(newDiscountPercent),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups", groupId, "discounts"] });
      toast({ title: "تم إضافة الخصم" });
      setNewDiscountServiceId("");
      setNewDiscountPercent("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleRemoveDiscount = async (discountId: number, groupId: number) => {
    try {
      await apiRequest("DELETE", `/api/vip-discounts/${discountId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vip-groups", groupId, "discounts"] });
      toast({ title: "تم حذف الخصم" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">مجموعات VIP</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 gap-2" data-testid="button-add-vip-group">
              <Plus className="w-4 h-4" /> إضافة مجموعة VIP
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white">
            <DialogHeader><DialogTitle>إضافة مجموعة VIP جديدة</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">اسم المجموعة</label>
                <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="مثلاً: VIP1" className="bg-black/20 border-white/10 h-12" data-testid="input-vip-group-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">نسبة الخصم العام (%)</label>
                <Input value={newGroupDiscount} onChange={e => setNewGroupDiscount(e.target.value)} type="number" placeholder="10" className="bg-black/20 border-white/10 h-12" data-testid="input-vip-global-discount" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={handleCreateGroup} data-testid="button-confirm-add-vip">إضافة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
      ) : !vipGroups?.length ? (
        <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
          <Crown className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">لا توجد مجموعات VIP حالياً</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vipGroups.map((group: any) => (
            <VipGroupCard
              key={group.id}
              group={group}
              services={services}
              expanded={expandedGroup === group.id}
              onToggleExpand={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              editingGroup={editingGroup}
              editDiscount={editDiscount}
              setEditingGroup={setEditingGroup}
              setEditDiscount={setEditDiscount}
              onUpdate={handleUpdateGroup}
              onDelete={handleDeleteGroup}
              newDiscountServiceId={newDiscountServiceId}
              newDiscountPercent={newDiscountPercent}
              setNewDiscountServiceId={setNewDiscountServiceId}
              setNewDiscountPercent={setNewDiscountPercent}
              onAddDiscount={handleAddDiscount}
              onRemoveDiscount={handleRemoveDiscount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VipGroupCard({ group, services, expanded, onToggleExpand, editingGroup, editDiscount, setEditingGroup, setEditDiscount, onUpdate, onDelete, newDiscountServiceId, newDiscountPercent, setNewDiscountServiceId, setNewDiscountPercent, onAddDiscount, onRemoveDiscount }: any) {
  const { data: discounts } = useQuery<any[]>({
    queryKey: ["/api/vip-groups", group.id, "discounts"],
    queryFn: async () => {
      const res = await fetch(`/api/vip-groups/${group.id}/discounts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch discounts");
      return res.json();
    },
    enabled: expanded,
  });

  return (
    <Card className="bg-slate-900 border-white/5 overflow-hidden transition-all hover:border-primary/20" data-testid={`card-vip-group-${group.id}`}>
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h4 className="font-bold text-white">{group.name}</h4>
            <span className="text-xs text-slate-400">خصم عام: {group.globalDiscount || 0}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${group.active !== false ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {group.active !== false ? 'نشط' : 'معطل'}
          </div>
          <Dialog open={editingGroup === group.id} onOpenChange={open => { if (!open) setEditingGroup(null); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10" onClick={() => { setEditingGroup(group.id); setEditDiscount(String(group.globalDiscount || 0)); }} data-testid={`button-edit-vip-${group.id}`}>
                <Wrench className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>تعديل مجموعة {group.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">نسبة الخصم العام (%)</label>
                  <Input value={editDiscount} onChange={e => setEditDiscount(e.target.value)} type="number" className="bg-black/20 border-white/10 h-12" data-testid="input-edit-vip-discount" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={() => onUpdate(group.id)} data-testid="button-confirm-edit-vip">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-lg" onClick={() => onDelete(group.id)} data-testid={`button-delete-vip-${group.id}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 bg-black/10">
        <button onClick={onToggleExpand} className="w-full text-xs text-slate-400 hover:text-white transition-colors py-1" data-testid={`button-toggle-discounts-${group.id}`}>
          {expanded ? 'إخفاء خصومات الخدمات ▲' : 'عرض خصومات الخدمات ▼'}
        </button>
        {expanded && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <select value={newDiscountServiceId} onChange={e => setNewDiscountServiceId(e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-lg h-9 px-2 text-xs outline-none" data-testid={`select-discount-service-${group.id}`}>
                <option value="" className="bg-slate-900">اختر الخدمة</option>
                {services?.map((s: any) => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
              </select>
              <Input value={newDiscountPercent} onChange={e => setNewDiscountPercent(e.target.value)} type="number" placeholder="%" className="w-20 bg-black/20 border-white/10 h-9 text-xs" data-testid={`input-discount-percent-${group.id}`} />
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-9 px-3 rounded-lg" onClick={() => onAddDiscount(group.id)} data-testid={`button-add-discount-${group.id}`}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {discounts?.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-slate-300 text-xs">{d.service?.name || `خدمة #${d.serviceId}`}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-teal-400 text-xs">{d.discountPercent}%</span>
                  <button className="text-red-500/50 hover:text-red-500 transition-colors" onClick={() => onRemoveDiscount(d.id, group.id)} data-testid={`button-remove-discount-${d.id}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {discounts?.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-2">لا توجد خصومات مخصصة</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function UsersManager() {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: updateUser } = useUpdateUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const { toast } = useToast();
  const { data: vipGroups } = useQuery<any[]>({ queryKey: ["/api/vip-groups"] });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;
    return users.filter((u: any) =>
      u.fullName.includes(searchQuery) || (u.phoneNumber && u.phoneNumber.includes(searchQuery)) || (u.email && u.email.includes(searchQuery))
    );
  }, [users, searchQuery]);

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateUser({ id, data: { active: !currentActive } });
  };

  const handleRoleChange = (id: number, role: string) => {
    updateUser({ id, data: { role } });
  };

  const handleBalanceUpdate = (id: number) => {
    const amount = parseInt(balanceAmount);
    if (isNaN(amount)) {
      toast({ title: "أدخل مبلغ صحيح", variant: "destructive" });
      return;
    }
    updateUser({ id, data: { balance: amount } });
    setBalanceAmount("");
    setEditingUser(null);
  };

  const queryClient = useQueryClient();

  const handleResetPassword = async (id: number) => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      toast({ title: "تم إعادة تعيين كلمة المرور بنجاح" });
      setNewPassword("");
      setResetPasswordUser(null);
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleAddBalance = async (id: number) => {
    const amount = parseInt(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "أدخل مبلغ صحيح للشحن", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}/add-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: `تم شحن ${amount.toLocaleString()} ر.ي بنجاح` });
      setBalanceAmount("");
      setEditingUser(null);
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleVipGroupChange = async (userId: number, vipGroupId: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/vip-group`, {
        vipGroupId: vipGroupId ? Number(vipGroupId) : null,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث مجموعة VIP" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleCurrencyChange = async (userId: number, currency: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/currency`, { currency });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث العملة" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-slate-900 border-white/10 h-12 pr-4"
          />
        </div>
        <div className="flex gap-4 items-center text-sm text-slate-400">
          <span className="bg-white/5 px-3 py-2 rounded-xl">{users?.length || 0} مستخدم مسجل</span>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : filteredUsers.map((u: any) => (
          <Card key={u.id} className={`bg-slate-900 border-white/5 overflow-hidden transition-all ${!u.active ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner border ${u.role === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                    {u.role === 'admin' ? <ShieldAlert className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg">{u.fullName}</h4>
                      {u.vipGroupId && vipGroups?.find((g: any) => g.id === u.vipGroupId) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" data-testid={`badge-vip-${u.id}`}>
                          <Crown className="w-3 h-3 inline ml-1" />
                          {vipGroups.find((g: any) => g.id === u.vipGroupId)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span className="font-mono">{u.phoneNumber || u.email || '-'}</span>
                      <span className="text-teal-400 font-bold flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> {(u.balance || 0).toLocaleString()} ر.ي</span>
                      {u.createdAt && <span>{format(new Date(u.createdAt), "yyyy/MM/dd")}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                    {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                  </div>
                  
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="user" className="bg-slate-900">مستخدم عادي</option>
                    <option value="admin" className="bg-slate-900">مدير</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 px-3 rounded-lg text-xs ${u.active ? 'border-green-500/20 text-green-400 hover:bg-green-500/10' : 'border-red-500/20 text-red-400 hover:bg-red-500/10'}`}
                    onClick={() => handleToggleActive(u.id, u.active)}
                  >
                    {u.active ? <><Eye className="w-3.5 h-3.5 ml-1" /> مفعل</> : <><EyeOff className="w-3.5 h-3.5 ml-1" /> محظور</>}
                  </Button>

                  <Dialog open={editingUser === u.id} onOpenChange={open => !open && setEditingUser(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs border-teal-500/20 text-teal-400 hover:bg-teal-500/10" onClick={() => { setEditingUser(u.id); setBalanceAmount(String(u.balance || 0)); }}>
                        <Wallet className="w-3.5 h-3.5 ml-1" /> الرصيد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white">
                      <DialogHeader><DialogTitle>تعديل رصيد {u.fullName}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="text-center text-3xl font-bold text-teal-400">{(u.balance || 0).toLocaleString()} ر.ي</div>
                        <Input value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} type="number" placeholder="المبلغ" className="bg-black/20 border-white/10 h-12 text-center text-xl font-mono" data-testid="input-balance-amount" />
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl gap-1" onClick={() => handleAddBalance(u.id)} data-testid="button-add-balance">
                            <Plus className="w-4 h-4" /> شحن رصيد
                          </Button>
                          <Button className="flex-1 bg-teal-600 hover:bg-teal-700 h-12 rounded-xl" onClick={() => handleBalanceUpdate(u.id)} data-testid="button-set-balance">تعيين الرصيد</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={resetPasswordUser === u.id} onOpenChange={open => { if (!open) { setResetPasswordUser(null); setNewPassword(""); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs border-orange-500/20 text-orange-400 hover:bg-orange-500/10" onClick={() => setResetPasswordUser(u.id)} data-testid={`button-reset-password-${u.id}`}>
                        <KeyRound className="w-3.5 h-3.5 ml-1" /> كلمة المرور
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white">
                      <DialogHeader><DialogTitle>إعادة تعيين كلمة مرور {u.fullName}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-400">أدخل كلمة المرور الجديدة للمستخدم (6 أحرف على الأقل)</p>
                        <Input
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          type="password"
                          placeholder="كلمة المرور الجديدة"
                          className="bg-black/20 border-white/10 h-12 text-center text-lg"
                          data-testid="input-new-password"
                        />
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl gap-2" onClick={() => handleResetPassword(u.id)} data-testid="button-confirm-reset-password">
                          <KeyRound className="w-4 h-4" /> تعيين كلمة المرور
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <select
                    value={u.vipGroupId || ""}
                    onChange={e => handleVipGroupChange(u.id, e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none"
                    data-testid={`select-vip-group-${u.id}`}
                  >
                    <option value="" className="bg-slate-900">بدون VIP</option>
                    {vipGroups?.map((g: any) => <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>)}
                  </select>

                  <select
                    value={u.currency || "YER"}
                    onChange={e => handleCurrencyChange(u.id, e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none"
                    data-testid={`select-currency-${u.id}`}
                  >
                    <option value="YER" className="bg-slate-900">YER ر.ي</option>
                    <option value="USD" className="bg-slate-900">USD $</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServiceGroupsManager() {
  const { data: groups, isLoading } = useServiceGroups();
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { mutate: createGroup } = useCreateServiceGroup();
  const { mutate: deleteGroup } = useDeleteServiceGroup();
  const { mutate: createService } = useCreateService();
  const { mutate: deleteService } = useDeleteService();
  const { mutate: updateGroup } = useUpdateServiceGroup();
  const { mutate: updateService } = useUpdateService();

  const [isUploading, setIsUploading] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupImage, setEditGroupImage] = useState("");
  const [editGroupNote, setEditGroupNote] = useState("");
  const [editGroupInputType, setEditGroupInputType] = useState("id");
  const [editGroupUploading, setEditGroupUploading] = useState(false);

  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");

  const groupForm = useForm({
    defaultValues: { name: "", categoryId: "", note: "", image: "", inputType: "id" }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      groupForm.setValue("image", url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditGroupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditGroupUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setEditGroupImage(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setEditGroupUploading(false);
    }
  };

  const serviceForm = useForm({
    defaultValues: { name: "", price: "", serviceGroupId: "" }
  });

  const onGroupSubmit = (data: any) => {
    createGroup({ ...data, categoryId: Number(data.categoryId), active: true }, { onSuccess: () => groupForm.reset() });
  };

  const onServiceSubmit = (data: any) => {
    createService({ ...data, price: Number(data.price), serviceGroupId: Number(data.serviceGroupId), active: true }, { onSuccess: () => serviceForm.reset() });
  };

  const handleToggleGroup = (id: number, currentActive: boolean) => {
    updateGroup({ id, data: { active: !currentActive } });
  };

  const openEditGroup = (group: any) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupImage(group.image || "");
    setEditGroupNote(group.note || "");
    setEditGroupInputType(group.inputType || "id");
  };

  const saveEditGroup = () => {
    if (!editingGroupId) return;
    updateGroup({ id: editingGroupId, data: { name: editGroupName, image: editGroupImage, note: editGroupNote, inputType: editGroupInputType } });
    setEditingGroupId(null);
  };

  const openEditService = (s: any) => {
    setEditingServiceId(s.id);
    setEditServiceName(s.name);
    setEditServicePrice(String(s.price));
  };

  const saveEditService = () => {
    if (!editingServiceId) return;
    updateService({ id: editingServiceId, data: { name: editServiceName, price: Number(editServicePrice) } });
    setEditingServiceId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة خدمة رئيسية</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">اسم الخدمة</label>
                <Input {...groupForm.register("name")} className="bg-black/20 border-white/10 h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">القسم</label>
                <select {...groupForm.register("categoryId")} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none" required>
                  <option value="" className="bg-slate-900">اختر القسم</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">ملاحظة</label>
                <Input {...groupForm.register("note")} className="bg-black/20 border-white/10 h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">صورة الخدمة</label>
                <div className="flex gap-2">
                  <Input {...groupForm.register("image")} placeholder="رابط أو إيموجي" className="bg-black/20 border-white/10 h-11" />
                  <div className="relative">
                    <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    <Button type="button" variant="outline" className="h-11 px-3 border-white/10 bg-black/20 hover:bg-white/5" onClick={() => document.getElementById("image-upload")?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">تنسيق الطلب</label>
                <select {...groupForm.register("inputType")} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none">
                  <option value="id" className="bg-slate-900">آيدي / رقم (ID)</option>
                  <option value="auth" className="bg-slate-900">بريد الكتروني وكلمة مرور</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 rounded-xl shadow-lg shadow-primary/20">إضافة</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة فئة سعرية</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">اسم الفئة</label>
                <Input {...serviceForm.register("name")} className="bg-black/20 border-white/10 h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">السعر (ر.ي)</label>
                <Input {...serviceForm.register("price")} type="number" className="bg-black/20 border-white/10 h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">الخدمة الرئيسية</label>
                <select {...serviceForm.register("serviceGroupId")} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none" required>
                  <option value="" className="bg-slate-900">اختر الخدمة</option>
                  {groups?.map((g: any) => <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11 rounded-xl">إضافة السعر</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups?.map((group: any) => (
            <Card key={group.id} className={`bg-slate-900 border-white/5 hover:border-primary/20 transition-all group overflow-hidden ${!group.active ? 'opacity-50' : ''}`}>
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                    {group.image?.startsWith('/') || group.image?.startsWith('http') ? (
                      <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{group.image || '🎮'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{group.name}</h4>
                    <span className="text-[10px] text-slate-500">{group.inputType === 'auth' ? 'بريد وكلمة مرور' : 'آيدي'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Dialog open={editingGroupId === group.id} onOpenChange={open => { if (!open) setEditingGroupId(null); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10" onClick={() => openEditGroup(group)} data-testid={`edit-group-${group.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white">
                      <DialogHeader><DialogTitle>تعديل خدمة: {group.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">اسم الخدمة</label>
                          <Input value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="bg-black/20 border-white/10 h-12" data-testid="input-edit-group-name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">صورة / أيقونة</label>
                          <div className="flex gap-2">
                            <Input value={editGroupImage} onChange={e => setEditGroupImage(e.target.value)} placeholder="رابط أو إيموجي" className="bg-black/20 border-white/10 h-12" data-testid="input-edit-group-image" />
                            <div className="relative">
                              <input type="file" id={`edit-group-image-${group.id}`} className="hidden" accept="image/*" onChange={handleEditGroupImageUpload} disabled={editGroupUploading} />
                              <Button type="button" variant="outline" className="h-12 px-3 border-white/10 bg-black/20 hover:bg-white/5" onClick={() => document.getElementById(`edit-group-image-${group.id}`)?.click()} disabled={editGroupUploading}>
                                {editGroupUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          {editGroupImage && (editGroupImage.startsWith('/') || editGroupImage.startsWith('http')) && (
                            <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                              <img src={editGroupImage} alt="preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">ملاحظة</label>
                          <Input value={editGroupNote} onChange={e => setEditGroupNote(e.target.value)} className="bg-black/20 border-white/10 h-12" data-testid="input-edit-group-note" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-400">تنسيق الطلب</label>
                          <select value={editGroupInputType} onChange={e => setEditGroupInputType(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-3 text-sm focus:border-primary outline-none">
                            <option value="id" className="bg-slate-900">آيدي / رقم (ID)</option>
                            <option value="auth" className="bg-slate-900">بريد الكتروني وكلمة مرور</option>
                          </select>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={saveEditGroup} data-testid="button-save-edit-group">حفظ التعديلات</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost" size="icon"
                    className={`h-8 w-8 rounded-lg ${group.active ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                    onClick={() => handleToggleGroup(group.id, group.active)}
                    data-testid={`toggle-group-${group.id}`}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteGroup(group.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-black/10">
                <div className="space-y-2">
                  {services?.filter((s: any) => s.serviceGroupId === group.id).map((s: any) => (
                    <div key={s.id} className={`flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors ${!s.active ? 'opacity-40' : ''}`}>
                      <span className="text-slate-300">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-400">{s.price.toLocaleString()} ر.ي</span>
                        <Dialog open={editingServiceId === s.id} onOpenChange={open => { if (!open) setEditingServiceId(null); }}>
                          <DialogTrigger asChild>
                            <button className="text-blue-400 hover:text-blue-300 transition-colors" onClick={() => openEditService(s)} data-testid={`edit-service-${s.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-white/10 text-white">
                            <DialogHeader><DialogTitle>تعديل: {s.name}</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm text-slate-400">اسم الفئة</label>
                                <Input value={editServiceName} onChange={e => setEditServiceName(e.target.value)} className="bg-black/20 border-white/10 h-12" data-testid="input-edit-service-name" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-slate-400">السعر (ر.ي)</label>
                                <Input value={editServicePrice} onChange={e => setEditServicePrice(e.target.value)} type="number" className="bg-black/20 border-white/10 h-12" data-testid="input-edit-service-price" />
                              </div>
                              <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={saveEditService} data-testid="button-save-edit-service">حفظ التعديلات</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button className={`transition-colors ${s.active ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`} onClick={() => updateService({ id: s.id, data: { active: !s.active } })} data-testid={`toggle-service-${s.id}`}>
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-red-500/50 hover:text-red-500 transition-colors" onClick={() => deleteService(s.id)}><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {services?.filter((s: any) => s.serviceGroupId === group.id).length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-2">لا توجد فئات سعرية</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesManager() {
  const { data: categories } = useCategories();
  const { mutate: createCat } = useCreateCategory();
  const { mutate: deleteCat } = useDeleteCategory();
  const [name, setName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catUploading, setCatUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatImage, setEditCatImage] = useState("");
  const [editCatUploading, setEditCatUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setter = isEdit ? setEditCatImage : setCatImage;
    const loadingSetter = isEdit ? setEditCatUploading : setCatUploading;
    loadingSetter(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setter(url);
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      loadingSetter(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    try {
      await apiRequest("PATCH", `/api/categories/${editingCategory.id}`, { name: editCatName, image: editCatImage || undefined });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم تحديث القسم" });
      setEditingCategory(null);
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900 border-white/5 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-slate-400">اسم القسم الجديد</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: تطبيقات، ألعاب..." className="bg-black/20 border-white/10 h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">صورة القسم</label>
              <div className="flex gap-2">
                <Input value={catImage} onChange={e => setCatImage(e.target.value)} placeholder="رابط أو إيموجي" className="bg-black/20 border-white/10 h-12" />
                <div className="relative">
                  <input type="file" id="cat-image-upload" className="hidden" accept="image/*" onChange={e => handleCatImageUpload(e, false)} disabled={catUploading} />
                  <Button type="button" variant="outline" className="h-12 px-3 border-white/10 bg-black/20 hover:bg-white/5" onClick={() => document.getElementById("cat-image-upload")?.click()} disabled={catUploading}>
                    {catUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => { createCat({ name, image: catImage || undefined } as any); setName(""); setCatImage(""); }} className="bg-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 w-full sm:w-auto">إضافة القسم</Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories?.map((c: any) => (
          <Card key={c.id} className="bg-slate-900 border-white/5 group overflow-hidden hover:border-primary/30 transition-all">
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform overflow-hidden">
                {c.image && (c.image.startsWith('/') || c.image.startsWith('http')) ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : c.image ? (
                  <span className="text-2xl">{c.image}</span>
                ) : (
                  <LayoutDashboard className="w-8 h-8 text-primary" />
                )}
              </div>
              <span className="font-bold text-white text-lg">{c.name}</span>
              <div className="flex gap-2 w-full mt-2">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10 flex-1" onClick={() => { setEditingCategory(c); setEditCatName(c.name); setEditCatImage(c.image || ""); }} data-testid={`button-edit-category-${c.id}`}>
                  <Pencil className="w-4 h-4 mr-2" /> تعديل
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 flex-1" onClick={() => deleteCat(c.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> حذف
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle>تعديل القسم</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">اسم القسم</label>
              <Input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="bg-black/20 border-white/10 h-12" data-testid="input-edit-category-name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">صورة / أيقونة القسم</label>
              <div className="flex gap-2">
                <Input value={editCatImage} onChange={e => setEditCatImage(e.target.value)} placeholder="رابط أو إيموجي" className="bg-black/20 border-white/10 h-12" data-testid="input-edit-category-image" />
                <div className="relative">
                  <input type="file" id="edit-cat-image-upload" className="hidden" accept="image/*" onChange={e => handleCatImageUpload(e, true)} disabled={editCatUploading} />
                  <Button type="button" variant="outline" className="h-12 px-3 border-white/10 bg-black/20 hover:bg-white/5" onClick={() => document.getElementById("edit-cat-image-upload")?.click()} disabled={editCatUploading}>
                    {editCatUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {editCatImage && (editCatImage.startsWith('/') || editCatImage.startsWith('http')) && (
                <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={editCatImage} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={handleEditCategory} data-testid="button-save-category">حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdsManager() {
  const { data: ads } = useAds();
  const { mutate: createAd } = useCreateAd();
  const { mutate: deleteAd } = useDeleteAd();
  const [adType, setAdType] = useState("text");
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("zap");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [editAdData, setEditAdData] = useState({ text: "", icon: "zap", imageUrl: "", linkUrl: "", adType: "text" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEditAd = async () => {
    if (!editingAd) return;
    try {
      await apiRequest("PATCH", `/api/ads/${editingAd.id}`, editAdData);
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "تم تحديث الإعلان" });
      setEditingAd(null);
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setImageUrl(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    createAd({ text: text || "إعلان", icon, active: true, imageUrl: imageUrl || null, linkUrl: linkUrl || null, adType } as any);
    setText(""); setImageUrl(""); setLinkUrl("");
  };

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900 border-white/5 p-6">
        <div className="space-y-5">
          <div className="flex gap-3">
            {[
              { id: 'text', label: 'نص متحرك', icon: '📝' },
              { id: 'image', label: 'صورة إعلانية', icon: '🖼️' },
            ].map(t => (
              <button key={t.id} onClick={() => setAdType(t.id)} className={`px-5 py-3 rounded-xl border transition-all font-bold text-sm ${adType === t.id ? 'bg-primary/10 border-primary text-primary' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {adType === 'text' && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm text-slate-400">نص الإعلان</label>
                <Input value={text} onChange={e => setText(e.target.value)} placeholder="مثلاً: عروض خاصة..." className="bg-black/20 border-white/10 h-12" />
              </div>
              <div className="w-full md:w-40 space-y-2">
                <label className="text-sm text-slate-400">الأيقونة</label>
                <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-3 text-white outline-none">
                  <option value="zap" className="bg-slate-900">⚡ فلاش</option>
                  <option value="star" className="bg-slate-900">⭐ مميز</option>
                  <option value="crown" className="bg-slate-900">👑 ملكي</option>
                  <option value="gift" className="bg-slate-900">🎁 هدية</option>
                  <option value="flame" className="bg-slate-900">🔥 ترند</option>
                </select>
              </div>
            </div>
          )}

          {adType === 'image' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">صورة الإعلان</label>
                <div className="flex gap-2">
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="رابط الصورة" className="bg-black/20 border-white/10 h-11" />
                  <div className="relative">
                    <input type="file" id="ad-image-upload" className="hidden" accept="image/*" onChange={handleAdImageUpload} disabled={isUploading} />
                    <Button type="button" variant="outline" className="h-11 px-3 border-white/10 bg-black/20 hover:bg-white/5" onClick={() => document.getElementById("ad-image-upload")?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-white/5" />}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">نص الإعلان (اختياري)</label>
                <Input value={text} onChange={e => setText(e.target.value)} placeholder="وصف مختصر..." className="bg-black/20 border-white/10 h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">رابط عند الضغط (اختياري)</label>
                <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="bg-black/20 border-white/10 h-11 font-mono" />
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} className="bg-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">نشر الإعلان</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {ads?.map((ad: any) => (
          <Card key={ad.id} className="bg-slate-900 border-white/5 p-4 flex justify-between items-center group hover:border-primary/20">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {ad.adType === 'image' && ad.imageUrl ? (
                <img src={ad.imageUrl} alt="" className="w-16 h-10 object-cover rounded-lg border border-white/5" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                  {ad.icon === 'zap' ? '⚡' : ad.icon === 'star' ? '⭐' : ad.icon === 'crown' ? '👑' : ad.icon === 'gift' ? '🎁' : '🔥'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-white font-medium block truncate">{ad.text}</span>
                {ad.linkUrl && <span className="text-xs text-blue-400 truncate block">{ad.linkUrl}</span>}
              </div>
              <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded-full bg-white/5 shrink-0">{ad.adType === 'image' ? 'صورة' : 'نص'}</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingAd(ad); setEditAdData({ text: ad.text || "", icon: ad.icon || "zap", imageUrl: ad.imageUrl || "", linkUrl: ad.linkUrl || "", adType: ad.adType || "text" }); }} data-testid={`button-edit-ad-${ad.id}`}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAd(ad.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editingAd} onOpenChange={(open) => !open && setEditingAd(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle>تعديل الإعلان</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">نوع الإعلان</label>
              <select value={editAdData.adType} onChange={e => setEditAdData({ ...editAdData, adType: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none" data-testid="select-edit-ad-type">
                <option value="text" className="bg-slate-900">نص متحرك</option>
                <option value="image" className="bg-slate-900">صورة إعلانية</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">نص الإعلان</label>
              <Input value={editAdData.text} onChange={e => setEditAdData({ ...editAdData, text: e.target.value })} className="bg-black/20 border-white/10 h-11" data-testid="input-edit-ad-text" />
            </div>
            {editAdData.adType === 'text' && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400">الأيقونة</label>
                <select value={editAdData.icon} onChange={e => setEditAdData({ ...editAdData, icon: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-white outline-none" data-testid="select-edit-ad-icon">
                  <option value="zap" className="bg-slate-900">فلاش</option>
                  <option value="star" className="bg-slate-900">مميز</option>
                  <option value="crown" className="bg-slate-900">ملكي</option>
                  <option value="gift" className="bg-slate-900">هدية</option>
                  <option value="flame" className="bg-slate-900">ترند</option>
                </select>
              </div>
            )}
            {editAdData.adType === 'image' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">رابط الصورة</label>
                  <Input value={editAdData.imageUrl} onChange={e => setEditAdData({ ...editAdData, imageUrl: e.target.value })} className="bg-black/20 border-white/10 h-11" data-testid="input-edit-ad-image" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">رابط عند الضغط</label>
                  <Input value={editAdData.linkUrl} onChange={e => setEditAdData({ ...editAdData, linkUrl: e.target.value })} className="bg-black/20 border-white/10 h-11 font-mono" data-testid="input-edit-ad-link" />
                </div>
              </>
            )}
            <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl" onClick={handleEditAd} data-testid="button-save-ad">حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BanksManager() {
  const { data: banks } = useBanks();
  const { mutate: createBank } = useCreateBank();
  const { mutate: deleteBank } = useDeleteBank();
  const form = useForm({ defaultValues: { bankName: "", accountName: "", accountNumber: "", note: "" } });
  const [editingBank, setEditingBank] = useState<any>(null);
  const [editBankData, setEditBankData] = useState({ bankName: "", accountName: "", accountNumber: "", note: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEditBank = async () => {
    if (!editingBank) return;
    try {
      await apiRequest("PATCH", `/api/banks/${editingBank.id}`, editBankData);
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({ title: "تم تحديث الحساب البنكي" });
      setEditingBank(null);
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    }
  };

  const onSubmit = (data: any) => {
    createBank(data, { onSuccess: () => form.reset() });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Card className="lg:col-span-4 bg-slate-900 border-white/5 h-fit">
        <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة حساب بنكي</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">اسم البنك</label>
              <Input {...form.register("bankName")} className="bg-black/20 border-white/10 h-11" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">اسم صاحب الحساب</label>
              <Input {...form.register("accountName")} className="bg-black/20 border-white/10 h-11" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">رقم الحساب</label>
              <Input {...form.register("accountNumber")} className="bg-black/20 border-white/10 h-11 font-mono" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">ملاحظة (اختياري)</label>
              <Input {...form.register("note")} className="bg-black/20 border-white/10 h-11" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 rounded-xl shadow-lg shadow-primary/20">حفظ</Button>
          </form>
        </CardContent>
      </Card>
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {banks?.map(bank => (
          <Card key={bank.id} className="bg-slate-900 border-white/5 p-6 relative group overflow-hidden hover:border-teal-500/30 transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-blue-500/10" onClick={() => { setEditingBank(bank); setEditBankData({ bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber, note: bank.note || "" }); }} data-testid={`button-edit-bank-${bank.id}`}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10" onClick={() => deleteBank(bank.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4 relative z-0">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shadow-inner border border-teal-500/10">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-1">{bank.bankName}</h4>
                <p className="text-slate-400 font-medium">{bank.accountName}</p>
                <p className="text-teal-400 font-mono tracking-widest text-lg mt-2">{bank.accountNumber}</p>
              </div>
              {bank.note && <div className="pt-3 border-t border-white/5 text-xs text-slate-500 italic">*{bank.note}</div>}
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editingBank} onOpenChange={(open) => !open && setEditingBank(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle>تعديل الحساب البنكي</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">اسم البنك</label>
              <Input value={editBankData.bankName} onChange={e => setEditBankData({ ...editBankData, bankName: e.target.value })} className="bg-black/20 border-white/10 h-11" data-testid="input-edit-bank-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">اسم صاحب الحساب</label>
              <Input value={editBankData.accountName} onChange={e => setEditBankData({ ...editBankData, accountName: e.target.value })} className="bg-black/20 border-white/10 h-11" data-testid="input-edit-account-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">رقم الحساب</label>
              <Input value={editBankData.accountNumber} onChange={e => setEditBankData({ ...editBankData, accountNumber: e.target.value })} className="bg-black/20 border-white/10 h-11 font-mono" data-testid="input-edit-account-number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">ملاحظة (اختياري)</label>
              <Input value={editBankData.note} onChange={e => setEditBankData({ ...editBankData, note: e.target.value })} className="bg-black/20 border-white/10 h-11" data-testid="input-edit-bank-note" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 h-11 rounded-xl shadow-lg shadow-primary/20" onClick={handleEditBank} data-testid="button-save-bank">حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoreSettingsManager() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const { toast } = useToast();
  const form = useForm({ defaultValues: { storeName: "", logoUrl: "", adminWhatsapp: "", exchangeRate: "" } });

  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName || "",
        logoUrl: settings.logoUrl || "",
        adminWhatsapp: settings.adminWhatsapp || "",
        exchangeRate: settings.exchangeRate ? String(settings.exchangeRate) : "",
      });
      setMaintenanceEnabled(settings.maintenanceEnabled || false);
      setMaintenanceMessage(settings.maintenanceMessage || "");
    }
  }, [settings, form]);

  const onSubmit = (data: any) => { updateSettings(data); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      form.setValue("logoUrl", url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setTogglingMaintenance(true);
    try {
      await apiRequest("POST", "/api/admin/maintenance/toggle", {
        enabled: !maintenanceEnabled,
        message: maintenanceMessage,
      });
      setMaintenanceEnabled(!maintenanceEnabled);
      toast({ title: !maintenanceEnabled ? "تم تفعيل وضع الصيانة" : "تم إلغاء وضع الصيانة" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    } finally {
      setTogglingMaintenance(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="bg-slate-900 border-white/5">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> إعدادات المتجر</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">اسم المتجر</label>
              <Input {...form.register("storeName")} className="bg-black/20 border-white/10 h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">رقم واتساب المدير (بدون +)</label>
              <Input {...form.register("adminWhatsapp")} placeholder="967775477340" className="bg-black/20 border-white/10 h-12 font-mono" />
              <p className="text-[10px] text-slate-500 mt-1 pr-1">* يستخدم لاستقبال الطلبات</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">رابط الشعار</label>
              <div className="flex gap-2">
                <Input {...form.register("logoUrl")} className="bg-black/20 border-white/10 h-12 flex-1" />
                <div className="relative">
                  <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                  <Button type="button" variant="outline" className="h-12 px-4 border-white/10 bg-black/20 hover:bg-white/5 gap-2" onClick={() => document.getElementById("logo-upload")?.click()} disabled={isUploadingLogo} data-testid="button-upload-logo">
                    {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    رفع
                  </Button>
                </div>
              </div>
              {settings?.logoUrl && (
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                  <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">سعر صرف الدولار (بالريال اليمني)</label>
              <Input {...form.register("exchangeRate")} type="number" placeholder="مثلاً: 250" className="bg-black/20 border-white/10 h-12 font-mono" data-testid="input-exchange-rate" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isPending} data-testid="button-save-settings">
              {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : 'حفظ التغييرات'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            وضع الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${maintenanceEnabled ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm text-slate-300">{maintenanceEnabled ? 'وضع الصيانة مفعل' : 'المتجر يعمل بشكل طبيعي'}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">رسالة الصيانة</label>
            <textarea
              value={maintenanceMessage}
              onChange={e => setMaintenanceMessage(e.target.value)}
              placeholder="الموقع تحت الصيانة، سنعود قريباً..."
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none min-h-[80px] resize-none"
              data-testid="input-maintenance-message"
            />
          </div>
          <Button
            onClick={handleToggleMaintenance}
            disabled={togglingMaintenance}
            className={`w-full h-12 rounded-xl font-bold gap-2 ${maintenanceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            data-testid="button-toggle-maintenance"
          >
            {togglingMaintenance ? <Loader2 className="animate-spin w-4 h-4" /> : <Power className="w-4 h-4" />}
            {maintenanceEnabled ? 'إلغاء وضع الصيانة' : 'تفعيل وضع الصيانة'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderReportsManager() {
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [groupId, setGroupId] = useState("");
  const { data: users } = useAdminUsers();
  const { data: groups } = useServiceGroups();

  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  if (userId && userId !== "all") params.set("userId", userId);
  if (groupId && groupId !== "all") params.set("serviceGroupId", groupId);
  const queryString = params.toString();
  const url = `/api/admin/reports/orders${queryString ? `?${queryString}` : ""}`;

  const { data: report, isLoading } = useQuery<{ orders: any[]; summary: any }>({
    queryKey: ["/api/admin/reports/orders", status, fromDate, toDate, userId, groupId],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("فشل جلب التقرير");
      return res.json();
    },
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/20",
      completed: "bg-green-500/20 text-green-400 border-green-500/20",
      rejected: "bg-red-500/20 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = { pending: "معلق", processing: "قيد المعالجة", completed: "مكتمل", rejected: "مرفوض" };
    return <Badge variant="outline" className={`${map[s] || ""} text-[10px]`}>{labels[s] || s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            فلترة التقارير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">الحالة</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-black/20 border-white/10 h-10" data-testid="select-report-status">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">من تاريخ</label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-black/20 border-white/10 h-10" data-testid="input-report-from" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">إلى تاريخ</label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-black/20 border-white/10 h-10" data-testid="input-report-to" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">المستخدم</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="bg-black/20 border-white/10 h-10" data-testid="select-report-user">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">المجموعة</label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="bg-black/20 border-white/10 h-10" data-testid="select-report-group">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {groups?.map((g: any) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="border-white/10 text-xs" onClick={() => { setStatus(""); setFromDate(""); setToDate(""); setUserId(""); setGroupId(""); }} data-testid="button-reset-filters">
              مسح الفلاتر
            </Button>
            {report?.orders?.length > 0 && (
              <Button variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10 text-xs gap-1" onClick={() => {
                const csvHeader = "رقم الطلب,المستخدم,الخدمة,السعر,الحالة,التاريخ\n";
                const csvRows = report.orders.map((o: any) => 
                  `${o.id},"${o.user?.fullName || '-'}","${o.service?.name || '-'}",${o.service?.price || 0},${o.status},${o.createdAt ? format(new Date(o.createdAt), "yyyy/MM/dd HH:mm") : "-"}`
                ).join("\n");
                const bom = "\uFEFF";
                const blob = new Blob([bom + csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `orders-report-${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }} data-testid="button-export-csv">
                <Download className="w-3 h-3" />
                تصدير CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {report?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white" data-testid="text-total-orders">{report.summary.totalOrders}</p>
              <p className="text-xs text-slate-400 mt-1">إجمالي الطلبات</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400" data-testid="text-pending-count">{report.summary.pendingCount}</p>
              <p className="text-xs text-slate-400 mt-1">معلقة</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-green-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400" data-testid="text-completed-count">{report.summary.completedCount}</p>
              <p className="text-xs text-slate-400 mt-1">مكتملة</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary" data-testid="text-total-revenue">{Number(report.summary.totalRevenue || 0).toLocaleString()} ر.ي</p>
              <p className="text-xs text-slate-400 mt-1">إجمالي الإيرادات</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            نتائج التقرير ({report?.orders?.length || 0} طلب)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
          ) : !report?.orders?.length ? (
            <div className="text-center py-12 text-slate-500">لا توجد طلبات بهذه الفلاتر</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-right">
                    <th className="p-3 text-slate-400 font-medium text-xs">#</th>
                    <th className="p-3 text-slate-400 font-medium text-xs">المستخدم</th>
                    <th className="p-3 text-slate-400 font-medium text-xs">الخدمة</th>
                    <th className="p-3 text-slate-400 font-medium text-xs">السعر</th>
                    <th className="p-3 text-slate-400 font-medium text-xs">الحالة</th>
                    <th className="p-3 text-slate-400 font-medium text-xs">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {report.orders.map((o: any) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors" data-testid={`row-report-order-${o.id}`}>
                      <td className="p-3 text-white font-mono text-xs">{o.id}</td>
                      <td className="p-3 text-white text-xs">{o.user?.fullName || "-"}</td>
                      <td className="p-3 text-white text-xs">{o.service?.name || "-"}</td>
                      <td className="p-3 text-primary text-xs font-medium">{Number(o.service?.price || 0).toLocaleString()} ر.ي</td>
                      <td className="p-3">{statusBadge(o.status)}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{o.createdAt ? format(new Date(o.createdAt), "yyyy/MM/dd HH:mm") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardStats() {
  const { data: stats, isLoading } = useQuery<{
    totalUsers: number;
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    newUsersToday: number;
  }>({ queryKey: ["/api/admin/dashboard-stats"], refetchInterval: 30000 });

  if (isLoading || !stats) return null;

  const cards = [
    { label: "إجمالي المبيعات", value: `${stats.totalRevenue.toLocaleString()} ر.ي`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "طلبات اليوم", value: stats.todayOrders, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "طلبات معلقة", value: stats.pendingOrders, icon: ShoppingBag, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { label: "طلبات مكتملة", value: stats.completedOrders, icon: Check, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "مستخدمين جدد اليوم", value: stats.newUsersToday, icon: UserPlus, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c, i) => (
        <Card key={i} className={`${c.bg} border`} data-testid={`stat-card-${i}`}>
          <CardContent className="p-3 text-center">
            <c.icon className={`w-5 h-5 ${c.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-white" data-testid={`stat-value-${i}`}>{c.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AdminActivityLogsManager() {
  const { data: logs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/activity-logs"] });

  return (
    <Card className="bg-slate-900 border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          سجل النشاطات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : !logs?.length ? (
          <div className="text-center py-12 text-slate-500">لا توجد نشاطات مسجلة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-right">
                  <th className="p-3 text-slate-400 font-medium text-xs">المدير</th>
                  <th className="p-3 text-slate-400 font-medium text-xs">الإجراء</th>
                  <th className="p-3 text-slate-400 font-medium text-xs">التفاصيل</th>
                  <th className="p-3 text-slate-400 font-medium text-xs">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-activity-${log.id}`}>
                    <td className="p-3 text-white text-xs">{log.user?.fullName || "-"}</td>
                    <td className="p-3 text-primary text-xs font-medium">{log.action}</td>
                    <td className="p-3 text-slate-400 text-xs max-w-xs truncate">{log.details || "-"}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{log.createdAt ? format(new Date(log.createdAt), "yyyy/MM/dd HH:mm") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BackupManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["/api/admin/backups"],
  });

  const createBackup = async () => {
    setIsCreating(true);
    try {
      await apiRequest("POST", "/api/admin/backups/create");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      toast({ title: "تم إنشاء النسخة الاحتياطية بنجاح" });
    } catch (e: any) {
      toast({ title: e.message || "فشل إنشاء النسخة", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/backups/${filename}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      toast({ title: "تم حذف النسخة الاحتياطية" });
    } catch (e: any) {
      toast({ title: e.message || "فشل الحذف", variant: "destructive" });
    }
  };

  const downloadBackup = (filename: string) => {
    window.open(`/api/admin/backups/download/${filename}`, '_blank');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReset = async (type: string) => {
    setIsResetting(true);
    try {
      await apiRequest("POST", `/api/admin/system/reset-${type}`);
      queryClient.invalidateQueries();
      toast({ title: "تمت العملية بنجاح" });
      setResetConfirm(null);
    } catch (e: any) {
      toast({ title: e.message || "فشلت العملية", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-white/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-primary" />
              النسخ الاحتياطي
            </CardTitle>
            <Button onClick={createBackup} disabled={isCreating} className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20" data-testid="button-create-backup">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              إنشاء نسخة احتياطية
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-6">يتم حفظ بيانات النظام كاملة (المستخدمين، الطلبات، الخدمات، الإعدادات) في ملف JSON يمكنك تحميله.</p>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !backups || (backups as any[]).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد نسخ احتياطية بعد</p>
              <p className="text-xs mt-1">اضغط على "إنشاء نسخة احتياطية" لإنشاء أول نسخة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(backups as any[]).map((backup: any) => (
                <div key={backup.filename} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileDown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{backup.filename}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(backup.createdAt).toLocaleString('ar-YE')}
                        </span>
                        <span className="text-xs text-slate-500">{formatSize(backup.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-blue-400 hover:bg-blue-500/10" onClick={() => downloadBackup(backup.filename)} data-testid={`download-backup-${backup.filename}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-red-400 hover:bg-red-500/10" onClick={() => deleteBackup(backup.filename)} data-testid={`delete-backup-${backup.filename}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-red-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-3 text-red-400">
            <ShieldAlert className="w-6 h-6" />
            تصفير البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-6">تحذير: هذه العمليات لا يمكن التراجع عنها. يُنصح بإنشاء نسخة احتياطية قبل التصفير.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-white">تصفير الأرصدة</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">تصفير رصيد جميع المستخدمين إلى صفر</p>
              {resetConfirm === 'balances' ? (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1" onClick={() => handleReset('balances')} disabled={isResetting} data-testid="confirm-reset-balances">
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد'}
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => setResetConfirm(null)}>إلغاء</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setResetConfirm('balances')} data-testid="button-reset-balances">تصفير</Button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">حذف الطلبات</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">حذف جميع الطلبات من النظام</p>
              {resetConfirm === 'orders' ? (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1" onClick={() => handleReset('orders')} disabled={isResetting} data-testid="confirm-reset-orders">
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد'}
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => setResetConfirm(null)}>إلغاء</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setResetConfirm('orders')} data-testid="button-reset-orders">حذف الكل</Button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">حذف الإيداعات</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">حذف جميع طلبات الإيداع</p>
              {resetConfirm === 'deposits' ? (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1" onClick={() => handleReset('deposits')} disabled={isResetting} data-testid="confirm-reset-deposits">
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد'}
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => setResetConfirm(null)}>إلغاء</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setResetConfirm('deposits')} data-testid="button-reset-deposits">حذف الكل</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAccountManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(user?.email || "");
  const [savingEmail, setSavingEmail] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPasswordVal || !confirmPassword) {
      toast({ title: "جميع الحقول مطلوبة", variant: "destructive" });
      return;
    }
    if (newPasswordVal !== confirmPassword) {
      toast({ title: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPasswordVal.length < 6) {
      toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: newPasswordVal, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPasswordVal("");
      setConfirmPassword("");
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateRecoveryEmail = async () => {
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      toast({ title: "أدخل بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }
    setSavingEmail(true);
    try {
      const res = await fetch(`/api/admin/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تم حفظ البريد الإلكتروني للاسترداد" });
    } catch (e: any) {
      toast({ title: e.message || "خطأ", variant: "destructive" });
    } finally {
      setSavingEmail(false);
    }
  };

  const { data: settingsData } = useSettings();
  const adminWhatsapp = settingsData?.adminWhatsapp || "";

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-400" />
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">كلمة المرور الحالية</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-current-password"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">كلمة المرور الجديدة</label>
              <Input
                type="password"
                value={newPasswordVal}
                onChange={e => setNewPasswordVal(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-admin-new-password"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">تأكيد كلمة المرور الجديدة</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="bg-black/20 border-white/10 h-12"
                data-testid="input-confirm-new-password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="bg-orange-600 hover:bg-orange-700 h-12 rounded-xl gap-2 w-full"
              data-testid="button-change-admin-password"
            >
              {changingPassword ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
              تغيير كلمة المرور
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            بريد استرداد الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">أضف بريدك الإلكتروني لاستعادة حسابك في حال نسيت كلمة المرور</p>
          <div className="max-w-md flex gap-3">
            <Input
              type="email"
              value={recoveryEmail}
              onChange={e => setRecoveryEmail(e.target.value)}
              placeholder="example@email.com"
              className="bg-black/20 border-white/10 h-12 flex-1"
              dir="ltr"
              data-testid="input-recovery-email"
            />
            <Button
              onClick={handleUpdateRecoveryEmail}
              disabled={savingEmail}
              className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl gap-2 px-6"
              data-testid="button-save-recovery-email"
            >
              {savingEmail ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            استرداد عبر واتساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-400">
            يمكنك استعادة حسابك عبر واتساب المرتبط بالنظام. عند طلب استعادة كلمة المرور، سيتم إرسال رمز التحقق إلى واتساب النظام.
          </p>
          {adminWhatsapp ? (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-bold text-sm">واتساب النظام مفعل</p>
                <p className="text-slate-400 text-xs font-mono" dir="ltr">{adminWhatsapp}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">واتساب النظام غير مضاف</p>
                <p className="text-slate-400 text-xs">أضف رقم واتساب من تبويب الإعدادات لتفعيل الاسترداد عبر واتساب</p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500">
            ملاحظة: يمكن أيضاً استعادة حسابك من صفحة تسجيل الدخول عبر خيار "نسيت كلمة المرور" باستخدام البريد الإلكتروني أو رقم واتساب.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
