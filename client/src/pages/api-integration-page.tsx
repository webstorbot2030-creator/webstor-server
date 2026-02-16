import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Trash2, Plus, ArrowLeft, Network, Link2, ScrollText, Key, Wifi, WifiOff, RefreshCw, Copy, ChevronDown, ChevronUp, Pencil, Power, ShieldAlert, Wallet, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import type { ApiProvider, ApiServiceMapping, ApiOrderLog, ApiToken, Service, User } from "@shared/schema";

export default function ApiIntegrationPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 rtl" dir="rtl">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-slate-900 border-l border-white/5 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Network className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">ربط API</h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/admin")} variant="ghost" className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12" data-testid="link-back-admin">
              <ShieldAlert className="w-5 h-5" />
              <span>لوحة الإدارة</span>
            </Button>
            <Button onClick={() => setLocation("/accounting")} variant="ghost" className="justify-start gap-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl h-12" data-testid="link-accounting">
              <Wallet className="w-5 h-5" />
              <span>النظام المحاسبي</span>
            </Button>
            <Button onClick={() => setLocation("/")} variant="ghost" className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12" data-testid="link-store">
              <ExternalLink className="w-5 h-5" />
              <span>العودة للمتجر</span>
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Tabs defaultValue="providers" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">إدارة ربط API</h2>
                  <p className="text-slate-400">إدارة المزودين والربط والتوكنات</p>
                </div>

                <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-2xl h-auto flex-wrap gap-1">
                  <TabsTrigger value="providers" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-providers">
                    <Network className="w-4 h-4" />
                    <span>المزودون</span>
                  </TabsTrigger>
                  <TabsTrigger value="mappings" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-mappings">
                    <Link2 className="w-4 h-4" />
                    <span>ربط الخدمات</span>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-logs">
                    <ScrollText className="w-4 h-4" />
                    <span>سجل العمليات</span>
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-tokens">
                    <Key className="w-4 h-4" />
                    <span>توكنات API</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="providers" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <ProvidersManager />
              </TabsContent>
              <TabsContent value="mappings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <MappingsManager />
              </TabsContent>
              <TabsContent value="logs" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <LogsManager />
              </TabsContent>
              <TabsContent value="tokens" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <TokensManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

const providerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  providerType: z.string().min(1, "نوع المزود مطلوب"),
  baseUrl: z.string().min(1, "رابط API مطلوب"),
  username: z.string().optional().default(""),
  password: z.string().optional().default(""),
  apiToken: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  currency: z.string().optional().default("USD"),
  notes: z.string().optional().default(""),
});

function ProvidersManager() {
  const { data: providers, isLoading } = useQuery<ApiProvider[]>({ queryKey: ["/api/admin/api-providers"] });
  const [showAdd, setShowAdd] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ApiProvider | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof providerSchema>>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: "", providerType: "megacenter", baseUrl: "", username: "", password: "", apiToken: "", isActive: true, currency: "USD", notes: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof providerSchema>) => {
      const res = await apiRequest("POST", "/api/admin/api-providers", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-providers"] });
      setShowAdd(false);
      form.reset();
      toast({ title: "تم إضافة المزود بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/api-providers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-providers"] });
      setEditingProvider(null);
      form.reset();
      toast({ title: "تم تحديث المزود بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/api-providers/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-providers"] });
      toast({ title: "تم حذف المزود" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/api-providers/${id}/test`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "نتيجة الاختبار", description: data.message || "تم الاتصال بنجاح" });
    },
    onError: (e: any) => toast({ title: "فشل الاتصال", description: e.message, variant: "destructive" }),
  });

  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/api-providers/${id}/sync-services`);
      return res.json();
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-mappings"] });
      toast({ title: "تم المزامنة", description: data.message || "تمت مزامنة الخدمات بنجاح" });
    },
    onError: (e: any) => toast({ title: "فشل المزامنة", description: e.message, variant: "destructive" }),
  });

  const openEdit = (provider: ApiProvider) => {
    setEditingProvider(provider);
    form.reset({
      name: provider.name,
      providerType: provider.providerType,
      baseUrl: provider.baseUrl,
      username: provider.username || "",
      password: provider.password || "",
      apiToken: provider.apiToken || "",
      isActive: provider.isActive ?? true,
      currency: provider.currency || "USD",
      notes: provider.notes || "",
    });
  };

  const openAdd = () => {
    setEditingProvider(null);
    form.reset({ name: "", providerType: "megacenter", baseUrl: "", username: "", password: "", apiToken: "", isActive: true, currency: "USD", notes: "" });
    setShowAdd(true);
  };

  const onSubmit = (data: z.infer<typeof providerSchema>) => {
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const providerTypeLabels: Record<string, string> = { megacenter: "ميجاسنتر", gunestek: "جونستيك", custom: "مخصص" };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-white">المزودون</h3>
        <Dialog open={showAdd || !!editingProvider} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingProvider(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={openAdd} data-testid="button-add-provider">
              <Plus className="w-4 h-4" />
              إضافة مزود
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">{editingProvider ? "تعديل المزود" : "إضافة مزود جديد"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">اسم المزود</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-provider-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="providerType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">نوع المزود</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-provider-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="megacenter">ميجاسنتر</SelectItem>
                        <SelectItem value="gunestek">جونستيك</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="baseUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">رابط API</FormLabel>
                    <FormControl><Input {...field} placeholder="https://api.example.com" className="bg-slate-800 border-white/10" data-testid="input-provider-url" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">اسم المستخدم</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-provider-username" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">كلمة المرور</FormLabel>
                    <FormControl><Input {...field} type="password" className="bg-slate-800 border-white/10" data-testid="input-provider-password" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="apiToken" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">توكن API</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-provider-token" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">العملة</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-provider-currency" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">ملاحظات</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-provider-notes" /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl" data-testid="button-submit-provider">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin w-4 h-4" /> : editingProvider ? "تحديث" : "إضافة"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(providers || []).length === 0 ? (
          <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
            <Network className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">لا يوجد مزودون بعد</p>
          </Card>
        ) : (providers || []).map(provider => (
          <Card key={provider.id} className="bg-slate-900 border-white/5 overflow-hidden transition-all hover:border-violet-500/30" data-testid={`provider-card-${provider.id}`}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider.isActive ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    {provider.isActive ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{provider.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <Badge variant="outline" className="text-xs">{providerTypeLabels[provider.providerType] || provider.providerType}</Badge>
                      <span className="font-mono text-xs">{provider.baseUrl}</span>
                      <span className="text-violet-400">{provider.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs border-green-500/20 text-green-400" onClick={() => testMutation.mutate(provider.id)} disabled={testMutation.isPending} data-testid={`button-test-provider-${provider.id}`}>
                    {testMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5 ml-1" />}
                    اختبار الاتصال
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs border-blue-500/20 text-blue-400" onClick={() => syncMutation.mutate(provider.id)} disabled={syncMutation.isPending} data-testid={`button-sync-provider-${provider.id}`}>
                    {syncMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 ml-1" />}
                    مزامنة الخدمات
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs border-yellow-500/20 text-yellow-400" onClick={() => openEdit(provider)} data-testid={`button-edit-provider-${provider.id}`}>
                    <Pencil className="w-3.5 h-3.5 ml-1" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs border-red-500/20 text-red-400" onClick={() => deleteMutation.mutate(provider.id)} data-testid={`button-delete-provider-${provider.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const mappingSchema = z.object({
  providerId: z.string().min(1, "المزود مطلوب"),
  localServiceId: z.string().min(1, "الخدمة المحلية مطلوبة"),
  externalServiceId: z.string().min(1, "معرف الخدمة الخارجية مطلوب"),
  externalServiceName: z.string().optional().default(""),
  externalPrice: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  autoForward: z.boolean().default(false),
});

function MappingsManager() {
  const { data: mappings, isLoading } = useQuery<ApiServiceMapping[]>({ queryKey: ["/api/admin/api-mappings"] });
  const { data: providers } = useQuery<ApiProvider[]>({ queryKey: ["/api/admin/api-providers"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const [showAdd, setShowAdd] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ApiServiceMapping | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof mappingSchema>>({
    resolver: zodResolver(mappingSchema),
    defaultValues: { providerId: "", localServiceId: "", externalServiceId: "", externalServiceName: "", externalPrice: "", isActive: true, autoForward: false },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/api-mappings", { ...data, providerId: Number(data.providerId), localServiceId: Number(data.localServiceId), externalPrice: data.externalPrice || null });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-mappings"] });
      setShowAdd(false);
      form.reset();
      toast({ title: "تم إضافة الربط بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/api-mappings/${id}`, { ...data, providerId: Number(data.providerId), localServiceId: Number(data.localServiceId), externalPrice: data.externalPrice || null });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-mappings"] });
      setEditingMapping(null);
      form.reset();
      toast({ title: "تم تحديث الربط" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/api-mappings/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-mappings"] });
      toast({ title: "تم حذف الربط" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const openEdit = (mapping: ApiServiceMapping) => {
    setEditingMapping(mapping);
    form.reset({
      providerId: String(mapping.providerId),
      localServiceId: String(mapping.localServiceId),
      externalServiceId: mapping.externalServiceId,
      externalServiceName: mapping.externalServiceName || "",
      externalPrice: mapping.externalPrice || "",
      isActive: mapping.isActive ?? true,
      autoForward: mapping.autoForward ?? false,
    });
  };

  const openAdd = () => {
    setEditingMapping(null);
    form.reset();
    setShowAdd(true);
  };

  const onSubmit = (data: z.infer<typeof mappingSchema>) => {
    if (editingMapping) {
      updateMutation.mutate({ id: editingMapping.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-white">ربط الخدمات</h3>
        <Dialog open={showAdd || !!editingMapping} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingMapping(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={openAdd} data-testid="button-add-mapping">
              <Plus className="w-4 h-4" />
              إضافة ربط
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">{editingMapping ? "تعديل الربط" : "إضافة ربط جديد"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="providerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">المزود</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-mapping-provider"><SelectValue placeholder="اختر المزود" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(providers || []).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="localServiceId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الخدمة المحلية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-mapping-service"><SelectValue placeholder="اختر الخدمة" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(services || []).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} - {s.price} ر.ي</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="externalServiceId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">معرف الخدمة الخارجية</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-mapping-external-id" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="externalServiceName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">اسم الخدمة الخارجية</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-mapping-external-name" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="externalPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">السعر الخارجي</FormLabel>
                    <FormControl><Input {...field} className="bg-slate-800 border-white/10" data-testid="input-mapping-external-price" /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" data-testid="checkbox-mapping-active" /></FormControl>
                      <FormLabel className="text-slate-300 !mt-0">مفعل</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="autoForward" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" data-testid="checkbox-mapping-autoforward" /></FormControl>
                      <FormLabel className="text-slate-300 !mt-0">تحويل تلقائي</FormLabel>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl" data-testid="button-submit-mapping">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin w-4 h-4" /> : editingMapping ? "تحديث" : "إضافة"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(mappings || []).length === 0 ? (
        <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
          <Link2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">لا يوجد ربط خدمات بعد</p>
        </Card>
      ) : (
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-400 text-right">المزود</TableHead>
                  <TableHead className="text-slate-400 text-right">الخدمة المحلية</TableHead>
                  <TableHead className="text-slate-400 text-right">المعرف الخارجي</TableHead>
                  <TableHead className="text-slate-400 text-right">الاسم الخارجي</TableHead>
                  <TableHead className="text-slate-400 text-right">السعر</TableHead>
                  <TableHead className="text-slate-400 text-right">الحالة</TableHead>
                  <TableHead className="text-slate-400 text-right">تلقائي</TableHead>
                  <TableHead className="text-slate-400 text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(mappings || []).map(mapping => {
                  const provider = (providers || []).find(p => p.id === mapping.providerId);
                  const service = (services || []).find(s => s.id === mapping.localServiceId);
                  return (
                    <TableRow key={mapping.id} className="border-white/5" data-testid={`mapping-row-${mapping.id}`}>
                      <TableCell className="text-white">{provider?.name || mapping.providerId}</TableCell>
                      <TableCell className="text-white">{service?.name || mapping.localServiceId}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{mapping.externalServiceId}</TableCell>
                      <TableCell className="text-slate-300">{mapping.externalServiceName || "-"}</TableCell>
                      <TableCell className="text-violet-400">{mapping.externalPrice || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={mapping.isActive ? "default" : "secondary"} className={`text-xs ${mapping.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {mapping.isActive ? "مفعل" : "معطل"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${mapping.autoForward ? "border-blue-500/20 text-blue-400" : "border-white/10 text-slate-500"}`}>
                          {mapping.autoForward ? "نعم" : "لا"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="text-yellow-400" onClick={() => openEdit(mapping)} data-testid={`button-edit-mapping-${mapping.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-400" onClick={() => deleteMutation.mutate(mapping.id)} data-testid={`button-delete-mapping-${mapping.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

function LogsManager() {
  const { data: logs, isLoading } = useQuery<(ApiOrderLog & { provider?: any; order?: any })[]>({ queryKey: ["/api/admin/api-logs"] });
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const directionLabels: Record<string, string> = { incoming: "وارد", outgoing: "صادر" };
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    success: "bg-green-500/20 text-green-400",
    completed: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
    error: "bg-red-500/20 text-red-400",
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">سجل العمليات</h3>

      {(logs || []).length === 0 ? (
        <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
          <ScrollText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">لا توجد عمليات مسجلة بعد</p>
        </Card>
      ) : (
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-400 text-right">الاتجاه</TableHead>
                  <TableHead className="text-slate-400 text-right">المزود</TableHead>
                  <TableHead className="text-slate-400 text-right">الطلب</TableHead>
                  <TableHead className="text-slate-400 text-right">الحالة</TableHead>
                  <TableHead className="text-slate-400 text-right">التاريخ</TableHead>
                  <TableHead className="text-slate-400 text-right">تفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs || []).map(log => (
                  <>
                    <TableRow key={log.id} className="border-white/5" data-testid={`log-row-${log.id}`}>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${log.direction === "incoming" ? "border-blue-500/20 text-blue-400" : "border-orange-500/20 text-orange-400"}`}>
                          {directionLabels[log.direction] || log.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{log.provider?.name || log.providerId}</TableCell>
                      <TableCell className="text-slate-300 font-mono text-xs">#{log.orderId || "-"}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColors[log.status || ""] || "bg-slate-500/20 text-slate-400"}`}>
                          {log.status || "غير محدد"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">{log.createdAt ? format(new Date(log.createdAt), "yyyy/MM/dd HH:mm") : "-"}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="text-slate-400" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} data-testid={`button-expand-log-${log.id}`}>
                          {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedLog === log.id && (
                      <TableRow key={`${log.id}-details`} className="border-white/5">
                        <TableCell colSpan={6}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <div>
                              <p className="text-xs text-slate-400 mb-2">بيانات الطلب (Request)</p>
                              <pre className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-300 overflow-x-auto max-h-40 whitespace-pre-wrap" data-testid={`text-log-request-${log.id}`}>
                                {log.requestData || "لا توجد بيانات"}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-2">بيانات الاستجابة (Response)</p>
                              <pre className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-300 overflow-x-auto max-h-40 whitespace-pre-wrap" data-testid={`text-log-response-${log.id}`}>
                                {log.responseData || "لا توجد بيانات"}
                              </pre>
                            </div>
                            {log.errorMessage && (
                              <div className="md:col-span-2">
                                <p className="text-xs text-red-400 mb-2">رسالة الخطأ</p>
                                <pre className="bg-red-900/20 rounded-xl p-3 text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">{log.errorMessage}</pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

const tokenSchema = z.object({
  userId: z.string().min(1, "المستخدم مطلوب"),
  name: z.string().min(1, "اسم التوكن مطلوب"),
  ipWhitelist: z.string().optional().default(""),
});

function TokensManager() {
  const { data: tokens, isLoading } = useQuery<(ApiToken & { user?: any })[]>({ queryKey: ["/api/admin/api-tokens"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { userId: "", name: "", ipWhitelist: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof tokenSchema>) => {
      const res = await apiRequest("POST", "/api/admin/api-tokens", { ...data, userId: Number(data.userId), isActive: true });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-tokens"] });
      setShowAdd(false);
      form.reset();
      toast({ title: "تم إنشاء التوكن بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/api-tokens/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-tokens"] });
      toast({ title: "تم تحديث حالة التوكن" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/api-tokens/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/api-tokens"] });
      toast({ title: "تم حذف التوكن" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const copyToken = (token: string, id: number) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast({ title: "تم نسخ التوكن" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-white">توكنات API</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" data-testid="button-add-token">
              <Plus className="w-4 h-4" />
              إنشاء توكن
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">إنشاء توكن جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">اسم التوكن</FormLabel>
                    <FormControl><Input {...field} placeholder="مثال: توكن التطبيق" className="bg-slate-800 border-white/10" data-testid="input-token-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="userId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">المستخدم</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-token-user"><SelectValue placeholder="اختر المستخدم" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(users || []).map(u => <SelectItem key={u.id} value={String(u.id)}>{u.fullName} - {u.phoneNumber}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ipWhitelist" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">قائمة IP المسموح بها</FormLabel>
                    <FormControl><Input {...field} placeholder="مثال: 192.168.1.1, 10.0.0.1" className="bg-slate-800 border-white/10" data-testid="input-token-ip" /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" disabled={createMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl" data-testid="button-submit-token">
                  {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "إنشاء"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(tokens || []).length === 0 ? (
        <Card className="bg-slate-900 border-dashed border-white/10 text-center py-20">
          <Key className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">لا توجد توكنات بعد</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(tokens || []).map(token => (
            <Card key={token.id} className="bg-slate-900 border-white/5 overflow-hidden" data-testid={`token-card-${token.id}`}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${token.isActive ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                      <Key className={`w-5 h-5 ${token.isActive ? "text-green-400" : "text-red-400"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white">{token.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                        <span>{token.user?.fullName || `مستخدم #${token.userId}`}</span>
                        {token.lastUsedAt && <span className="text-xs">آخر استخدام: {format(new Date(token.lastUsedAt), "yyyy/MM/dd HH:mm")}</span>}
                        {token.ipWhitelist && <span className="text-xs font-mono">{token.ipWhitelist}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="bg-slate-800/50 px-3 py-1.5 rounded-lg text-xs font-mono text-violet-300 truncate max-w-xs" data-testid={`text-token-value-${token.id}`}>{token.token}</code>
                        <Button size="icon" variant="ghost" className="shrink-0 text-slate-400" onClick={() => copyToken(token.token, token.id)} data-testid={`button-copy-token-${token.id}`}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <Button size="sm" variant="outline" className={`rounded-lg text-xs ${token.isActive ? "border-green-500/20 text-green-400" : "border-red-500/20 text-red-400"}`} onClick={() => toggleMutation.mutate({ id: token.id, isActive: !token.isActive })} data-testid={`button-toggle-token-${token.id}`}>
                      <Power className="w-3.5 h-3.5 ml-1" />
                      {token.isActive ? "مفعل" : "معطل"}
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-400" onClick={() => deleteMutation.mutate(token.id)} data-testid={`button-delete-token-${token.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
