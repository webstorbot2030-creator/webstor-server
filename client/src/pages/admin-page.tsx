import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useCategories, useCreateCategory, useDeleteCategory, useServices, useCreateService, useDeleteService, useAds, useCreateAd, useDeleteAd, useBanks, useCreateBank, useDeleteBank, useSettings, useUpdateSettings, useServiceGroups, useCreateServiceGroup, useDeleteServiceGroup } from "@/hooks/use-store";
import { Loader2, Trash2, Plus, Check, X, LayoutDashboard, ShoppingBag, Package, ListTree, Megaphone, Landmark, Settings, ExternalLink } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-200 rtl" dir="rtl">
      {/* Sidebar-style Header */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-slate-900 border-l border-white/5 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
          </div>

          <nav className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/")} variant="ghost" className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12">
              <ExternalLink className="w-5 h-5" />
              <span>العودة للمتجر</span>
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <Tabs defaultValue="orders" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">مرحباً، {user.fullName}</h2>
                  <p className="text-slate-400">إليك نظرة عامة على متجرك اليوم</p>
                </div>
                
                <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-2xl h-auto flex-wrap gap-1">
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <ShoppingBag className="w-4 h-4" />
                    <span>الطلبات</span>
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <ListTree className="w-4 h-4" />
                    <span>الخدمات</span>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>الأقسام</span>
                  </TabsTrigger>
                  <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <Megaphone className="w-4 h-4" />
                    <span>الإعلانات</span>
                  </TabsTrigger>
                  <TabsTrigger value="banks" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <Landmark className="w-4 h-4" />
                    <span>البنوك</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white px-5 py-2.5 rounded-xl transition-all flex gap-2 items-center">
                    <Settings className="w-4 h-4" />
                    <span>الإعدادات</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="orders" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <OrdersManager />
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Sub Components ---

function OrdersManager() {
  const [filter, setFilter] = useState('all');
  const { data: orders, isLoading } = useAllOrders(filter);
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const handleStatus = (id: number, status: string, reason?: string) => {
    updateStatus({ id, data: { status, rejectionReason: reason } });
    if (status === 'rejected') {
      setRejectId(null);
      setReason("");
    }
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
          <Button 
            key={s.id} 
            variant={filter === s.id ? 'default' : 'outline'} 
            onClick={() => setFilter(s.id)}
            className={`rounded-xl px-6 h-11 transition-all ${
              filter === s.id 
                ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.label}
          </Button>
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
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    order.status === 'processing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    order.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'processing' ? 'قيد التنفيذ' : order.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status !== 'completed' && order.status !== 'rejected' && (
                       <>
                         {order.status === 'pending' && (
                           <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-xl" onClick={() => handleStatus(order.id, 'processing')}>
                             بدء التنفيذ
                           </Button>
                         )}
                         <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-4 rounded-xl" onClick={() => handleStatus(order.id, 'completed')}>
                           <Check className="w-4 h-4 ml-1" /> إكمال
                         </Button>
                         <Dialog open={rejectId === order.id} onOpenChange={(open) => !open && setRejectId(null)}>
                           <DialogTrigger asChild>
                             <Button size="sm" variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => setRejectId(order.id)}>
                               <X className="w-4 h-4 ml-1" /> رفض
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="bg-slate-900 border-white/10 text-white">
                             <DialogHeader><DialogTitle>سبب الرفض</DialogTitle></DialogHeader>
                             <div className="space-y-4 py-4">
                               <Input 
                                 value={reason} 
                                 onChange={e => setReason(e.target.value)} 
                                 placeholder="اكتب سبب الرفض هنا ليظهر للمستخدم..."
                                 className="bg-black/20 border-white/10 h-12" 
                               />
                               <Button className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-xl" onClick={() => handleStatus(order.id, 'rejected', reason)}>تأكيد الرفض</Button>
                             </div>
                           </DialogContent>
                         </Dialog>
                       </>
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

function ServiceGroupsManager() {
  const { data: groups, isLoading } = useServiceGroups();
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { mutate: createGroup } = useCreateServiceGroup();
  const { mutate: deleteGroup } = useDeleteServiceGroup();
  const { mutate: createService } = useCreateService();
  const { mutate: deleteService } = useDeleteService();

  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const groupForm = useForm({
    defaultValues: { name: "", categoryId: "", note: "", image: "" }
  });

  const serviceForm = useForm({
    defaultValues: { name: "", price: "", serviceGroupId: "" }
  });

  const onGroupSubmit = (data: any) => {
    createGroup({
      ...data,
      categoryId: Number(data.categoryId),
      active: true
    }, { onSuccess: () => groupForm.reset() });
  };

  const onServiceSubmit = (data: any) => {
    createService({
      ...data,
      price: Number(data.price),
      serviceGroupId: Number(data.serviceGroupId),
      active: true
    }, { onSuccess: () => serviceForm.reset() });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Group Creation */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة خدمة رئيسية (لعبة/تطبيق)</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">اسم الخدمة (مثلاً: بوبجي)</label>
                <Input {...groupForm.register("name")} className="bg-black/20 border-white/10 h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">القسم</label>
                <select {...groupForm.register("categoryId")} className="w-full bg-black/20 border border-white/10 rounded-xl h-11 px-3 text-sm focus:border-primary outline-none" required>
                  <option value="" className="bg-slate-900">اختر القسم</option>
                  {categories?.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">ملاحظة (تظهر للمستخدم)</label>
                <Input {...groupForm.register("note")} className="bg-black/20 border-white/10 h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">إيموجي أو رابط صورة</label>
                <Input {...groupForm.register("image")} placeholder="💎" className="bg-black/20 border-white/10 h-11" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 rounded-xl shadow-lg shadow-primary/20">إضافة الخدمة الرئيسية</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة فئة سعرية</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">اسم الفئة (مثلاً: 60 شدة)</label>
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
                  {groups?.map(g => <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11 rounded-xl shadow-lg shadow-teal-900/20">إضافة السعر</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List Display */}
      <div className="lg:col-span-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups?.map(group => (
            <Card key={group.id} className="bg-slate-900 border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.image || '🎮'}</span>
                  <h4 className="font-bold text-white">{group.name}</h4>
                </div>
                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteGroup(group.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 bg-black/10">
                <div className="space-y-2">
                  {services?.filter(s => s.serviceGroupId === group.id).map(s => (
                    <div key={s.id} className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="text-slate-300">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-400">{s.price.toLocaleString()} ر.ي</span>
                        <button className="text-red-500/50 hover:text-red-500 transition-colors" onClick={() => deleteService(s.id)}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {services?.filter(s => s.serviceGroupId === group.id).length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-2">لا توجد فئات سعرية مضافة</p>
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

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900 border-white/5 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-400">اسم القسم الجديد</label>
            <Input 
              value={name} onChange={e => setName(e.target.value)} 
              placeholder="مثلاً: تطبيقات الشات، ألعاب أونلاين..." 
              className="bg-black/20 border-white/10 h-12 text-lg" 
            />
          </div>
          <Button onClick={() => { createCat({ name }); setName(""); }} className="bg-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">إضافة القسم</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories?.map(c => (
          <Card key={c.id} className="bg-slate-900 border-white/5 group overflow-hidden hover:border-primary/30 transition-all">
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <span className="font-bold text-white text-lg">{c.name}</span>
              <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 w-full mt-2" onClick={() => deleteCat(c.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> حذف القسم
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdsManager() {
  const { data: ads } = useAds();
  const { mutate: createAd } = useCreateAd();
  const { mutate: deleteAd } = useDeleteAd();
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("zap");

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900 border-white/5 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-400">نص شريط الإعلانات</label>
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="مثلاً: يتوفر لدينا الآن شحن بوبجي بأسعار مخفضة!" className="bg-black/20 border-white/10 h-12" />
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm text-slate-400">الأيقونة</label>
            <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-3 text-white outline-none">
              <option value="zap" className="bg-slate-900">⚡ فلاش</option>
              <option value="star" className="bg-slate-900">⭐ مميز</option>
              <option value="crown" className="bg-slate-900">👑 ملكي</option>
              <option value="gift" className="bg-slate-900">🎁 هدية</option>
              <option value="flame" className="bg-slate-900">🔥 ترند</option>
            </select>
          </div>
          <Button onClick={() => { createAd({ text, icon }); setText(""); }} className="bg-primary h-12 px-8 mt-auto rounded-xl font-bold shadow-lg shadow-primary/20">نشر الإعلان</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {ads?.map(ad => (
          <Card key={ad.id} className="bg-slate-900 border-white/5 p-4 flex justify-between items-center group hover:border-primary/20">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                 {ad.icon === 'zap' ? '⚡' : ad.icon === 'star' ? '⭐' : ad.icon === 'crown' ? '👑' : ad.icon === 'gift' ? '🎁' : '🔥'}
               </div>
               <span className="text-white font-medium">{ad.text}</span>
             </div>
             <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAd(ad.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BanksManager() {
  const { data: banks } = useBanks();
  const { mutate: createBank } = useCreateBank();
  const { mutate: deleteBank } = useDeleteBank();
  
  const form = useForm({ defaultValues: { bankName: "", accountName: "", accountNumber: "", note: "" } });

  const onSubmit = (data: any) => {
    createBank(data, { onSuccess: () => form.reset() });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Card className="lg:col-span-4 bg-slate-900 border-white/5 h-fit">
        <CardHeader className="pb-4"><CardTitle className="text-xl">إضافة حساب بنكي جديد</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 pr-1">اسم البنك</label>
              <Input {...form.register("bankName")} placeholder="مثلاً: بنك الكريمي" className="bg-black/20 border-white/10 h-11" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 pr-1">اسم صاحب الحساب</label>
              <Input {...form.register("accountName")} placeholder="الاسم الكامل" className="bg-black/20 border-white/10 h-11" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 pr-1">رقم الحساب</label>
              <Input {...form.register("accountNumber")} placeholder="0000000" className="bg-black/20 border-white/10 h-11 font-mono" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 pr-1">ملاحظة (اختياري)</label>
              <Input {...form.register("note")} placeholder="إيداع فقط، تحويل سريع..." className="bg-black/20 border-white/10 h-11" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 mt-2 rounded-xl shadow-lg shadow-primary/20">حفظ الحساب البنكي</Button>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {banks?.map(bank => (
          <Card key={bank.id} className="bg-slate-900 border-white/5 p-6 relative group overflow-hidden hover:border-teal-500/30 transition-all">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
             <Button variant="ghost" size="icon" className="absolute top-3 left-3 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => deleteBank(bank.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
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
    </div>
  );
}

function StoreSettingsManager() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  
  const form = useForm({
    defaultValues: {
      storeName: settings?.storeName || "",
      logoUrl: settings?.logoUrl || "",
      adminWhatsapp: settings?.adminWhatsapp || ""
    }
  });

  // Re-sync form when data loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName || "",
        logoUrl: settings.logoUrl || "",
        adminWhatsapp: settings.adminWhatsapp || ""
      });
    }
  }, [settings, form]);

  const onSubmit = (data: any) => {
    updateSettings(data);
  };

  return (
    <Card className="bg-slate-900 border-white/5 max-w-2xl mx-auto">
      <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> إعدادات المتجر العامة</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">اسم المتجر</label>
            <Input {...form.register("storeName")} className="bg-black/20 border-white/10 h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">رقم واتساب المدير (بدون +)</label>
            <Input {...form.register("adminWhatsapp")} placeholder="967775477340" className="bg-black/20 border-white/10 h-12 font-mono" />
            <p className="text-[10px] text-slate-500 mt-1 pr-1">* يستخدم لاستقبال الطلبات مباشرة من العملاء</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">رابط الشعار (URL)</label>
            <Input {...form.register("logoUrl")} className="bg-black/20 border-white/10 h-12" />
            {settings?.logoUrl && (
              <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                <img src={settings.logoUrl} alt="Logo Preview" className="h-20 object-contain" />
              </div>
            )}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : 'حفظ التغييرات'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

