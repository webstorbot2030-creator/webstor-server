import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useCategories, useCreateCategory, useDeleteCategory, useServices, useCreateService, useDeleteService, useAds, useCreateAd, useDeleteAd, useBanks, useCreateBank, useDeleteBank } from "@/hooks/use-store";
import { Loader2, Trash2, Plus, Check, X, ShieldAlert } from "lucide-react";
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

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 rtl" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
          <Button onClick={() => setLocation("/")} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            العودة للمتجر
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-slate-900 border border-white/10 p-1 rounded-xl h-auto flex-wrap justify-start gap-2">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary px-6 py-2 rounded-lg">الطلبات</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-primary px-6 py-2 rounded-lg">الخدمات</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-primary px-6 py-2 rounded-lg">الأقسام</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary px-6 py-2 rounded-lg">الإعلانات</TabsTrigger>
            <TabsTrigger value="banks" className="data-[state=active]:bg-primary px-6 py-2 rounded-lg">البنوك</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="ads">
            <AdsManager />
          </TabsContent>

          <TabsContent value="banks">
            <BanksManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub Components for cleanliness ---

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
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'processing', 'completed', 'rejected'].map(s => (
          <Button 
            key={s} 
            variant={filter === s ? 'default' : 'outline'} 
            onClick={() => setFilter(s)}
            className={`capitalize rounded-full ${filter === s ? 'bg-primary' : 'bg-transparent border-white/20 text-gray-300'}`}
          >
            {s === 'all' ? 'الكل' : s === 'pending' ? 'قيد الانتظار' : s === 'processing' ? 'قيد التنفيذ' : s === 'completed' ? 'مكتمل' : 'مرفوض'}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {isLoading ? <Loader2 className="animate-spin mx-auto text-primary" /> : orders?.map(order => (
          <Card key={order.id} className="bg-slate-900 border-white/10 text-white">
            <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">#{order.id}</span>
                  <h3 className="font-bold text-lg text-primary">{order.service.name}</h3>
                </div>
                <div className="text-sm text-gray-400 grid grid-cols-2 gap-x-8 gap-y-1">
                  <span>المستخدم: {order.user.fullName}</span>
                  <span>الهاتف: {order.user.phoneNumber}</span>
                  <span className="font-mono text-teal-400">ID: {order.userInputId}</span>
                  <span>{format(new Date(order.createdAt!), "yyyy-MM-dd HH:mm")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {order.status !== 'completed' && order.status !== 'rejected' && (
                   <>
                     {order.status === 'pending' && (
                       <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatus(order.id, 'processing')}>
                         بدء التنفيذ
                       </Button>
                     )}
                     <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatus(order.id, 'completed')}>
                       <Check className="w-4 h-4 mr-1" /> إكمال
                     </Button>
                     <Dialog open={rejectId === order.id} onOpenChange={(open) => !open && setRejectId(null)}>
                       <DialogTrigger asChild>
                         <Button size="sm" variant="destructive" onClick={() => setRejectId(order.id)}>
                           <X className="w-4 h-4 mr-1" /> رفض
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="bg-slate-900 border-white/10 text-white">
                         <DialogHeader><DialogTitle>سبب الرفض</DialogTitle></DialogHeader>
                         <Input 
                           value={reason} 
                           onChange={e => setReason(e.target.value)} 
                           placeholder="اكتب سبب الرفض هنا..."
                           className="bg-black/20 border-white/20" 
                         />
                         <Button variant="destructive" onClick={() => handleStatus(order.id, 'rejected', reason)}>تأكيد الرفض</Button>
                       </DialogContent>
                     </Dialog>
                   </>
                )}
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  order.status === 'pending' ? 'border-yellow-500 text-yellow-500' :
                  order.status === 'processing' ? 'border-blue-500 text-blue-500' :
                  order.status === 'completed' ? 'border-green-500 text-green-500' :
                  'border-red-500 text-red-500'
                }`}>
                  {order.status}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServicesManager() {
  const { data: services, isLoading } = useServices();
  const { data: categories } = useCategories();
  const { mutate: createService } = useCreateService();
  const { mutate: deleteService } = useDeleteService();

  const form = useForm({
    defaultValues: { name: "", price: "", categoryId: "", note: "", image: "" }
  });

  const onSubmit = (data: any) => {
    createService({
      ...data,
      price: Number(data.price),
      categoryId: Number(data.categoryId),
      image: data.image || "💎"
    }, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-slate-900 border-white/10 text-white">
          <CardHeader><CardTitle>إضافة خدمة</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <Input {...form.register("name")} placeholder="اسم الخدمة" className="bg-black/20 border-white/20" />
              <Input {...form.register("price")} type="number" placeholder="السعر" className="bg-black/20 border-white/20" />
              <select {...form.register("categoryId")} className="w-full bg-black/20 border border-white/20 rounded-md p-2 text-sm">
                <option value="">اختر القسم</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input {...form.register("note")} placeholder="ملاحظات (اختياري)" className="bg-black/20 border-white/20" />
              <Input {...form.register("image")} placeholder="رابط صورة أو أيقونة (اختياري)" className="bg-black/20 border-white/20" />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">إضافة</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-3">
        {services?.map(s => (
          <div key={s.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5">
            <div>
              <p className="font-bold text-white">{s.name}</p>
              <p className="text-sm text-gray-400">{s.category?.name} - <span className="text-teal-400">{s.price} ر.ي</span></p>
            </div>
            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10" onClick={() => deleteService(s.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
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
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input 
          value={name} onChange={e => setName(e.target.value)} 
          placeholder="اسم القسم الجديد" 
          className="bg-slate-900 border-white/20 text-white" 
        />
        <Button onClick={() => { createCat({ name }); setName(""); }} className="bg-primary">إضافة</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories?.map(c => (
          <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
            <span className="font-bold text-white">{c.name}</span>
            <Button variant="ghost" size="icon" className="text-red-400 h-8 w-8" onClick={() => deleteCat(c.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
    <div className="space-y-6">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="نص الإعلان" className="bg-slate-900 border-white/20 text-white flex-1" />
        <select value={icon} onChange={e => setIcon(e.target.value)} className="bg-slate-900 border border-white/20 rounded-md p-2 text-white w-32">
          <option value="zap">⚡ عرض</option>
          <option value="star">⭐ نجمة</option>
          <option value="crown">👑 تاج</option>
          <option value="gift">🎁 هدية</option>
        </select>
        <Button onClick={() => { createAd({ text, icon }); setText(""); }} className="bg-primary">إضافة</Button>
      </div>
      <div className="space-y-2">
        {ads?.map(ad => (
          <div key={ad.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5">
             <div className="flex items-center gap-3">
               <span className="bg-white/10 p-2 rounded-md">{ad.icon === 'zap' ? '⚡' : '✨'}</span>
               <span className="text-white">{ad.text}</span>
             </div>
             <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deleteAd(ad.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-slate-900 border-white/10 text-white h-fit">
        <CardHeader><CardTitle>إضافة حساب بنكي</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <Input {...form.register("bankName")} placeholder="اسم البنك" className="bg-black/20 border-white/20" />
            <Input {...form.register("accountName")} placeholder="اسم صاحب الحساب" className="bg-black/20 border-white/20" />
            <Input {...form.register("accountNumber")} placeholder="رقم الحساب" className="bg-black/20 border-white/20" />
            <Input {...form.register("note")} placeholder="ملاحظة" className="bg-black/20 border-white/20" />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">إضافة</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {banks?.map(bank => (
          <div key={bank.id} className="bg-white/5 p-4 rounded-xl border border-white/10 relative">
             <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-red-400 hover:bg-red-500/10" onClick={() => deleteBank(bank.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <h4 className="font-bold text-teal-400">{bank.bankName}</h4>
            <p className="text-white font-medium">{bank.accountName}</p>
            <p className="text-gray-400 font-mono tracking-wider">{bank.accountNumber}</p>
            {bank.note && <p className="text-xs text-gray-500 mt-2">{bank.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
