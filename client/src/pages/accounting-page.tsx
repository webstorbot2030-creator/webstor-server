import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Trash2, Plus, ArrowLeft, BookOpen, Wallet, FileText, BarChart3, Calendar, Lock, ChevronDown, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Account, Fund, JournalEntry, JournalLine, AccountingPeriod } from "@shared/schema";

function useAccounts() {
  return useQuery<Account[]>({ queryKey: ["/api/accounting/accounts"] });
}

function useFunds() {
  return useQuery<Fund[]>({ queryKey: ["/api/accounting/funds"] });
}

function useJournalEntries(periodId?: number) {
  const url = periodId ? `/api/accounting/journal-entries?periodId=${periodId}` : "/api/accounting/journal-entries";
  return useQuery<(JournalEntry & { lines?: JournalLine[] })[]>({ queryKey: ["/api/accounting/journal-entries", periodId] , queryFn: async () => { const res = await fetch(url, { credentials: "include" }); if (!res.ok) throw new Error("Failed"); return res.json(); }});
}

function usePeriods() {
  return useQuery<AccountingPeriod[]>({ queryKey: ["/api/accounting/periods"] });
}

function useTrialBalance(periodId?: number) {
  const url = periodId ? `/api/accounting/reports/trial-balance?periodId=${periodId}` : "/api/accounting/reports/trial-balance";
  return useQuery<{ accountId: number; code: string; nameAr: string; type: string; debit: string; credit: string }[]>({ queryKey: ["/api/accounting/reports/trial-balance", periodId], queryFn: async () => { const res = await fetch(url, { credentials: "include" }); if (!res.ok) throw new Error("Failed"); return res.json(); }});
}

function useAccountBalances(periodId?: number) {
  const url = periodId ? `/api/accounting/reports/balances?periodId=${periodId}` : "/api/accounting/reports/balances";
  return useQuery<{ accountId: number; code: string; nameAr: string; type: string; totalDebit: string; totalCredit: string; balance: string }[]>({ queryKey: ["/api/accounting/reports/balances", periodId], queryFn: async () => { const res = await fetch(url, { credentials: "include" }); if (!res.ok) throw new Error("Failed"); return res.json(); }});
}

export default function AccountingPage() {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">النظام المحاسبي</h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/admin")} variant="ghost" className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12" data-testid="link-back-admin">
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للوحة الإدارة</span>
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Tabs defaultValue="accounts" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">النظام المحاسبي</h2>
                  <p className="text-slate-400">إدارة الحسابات والقيود والتقارير المالية</p>
                </div>

                <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-2xl h-auto flex-wrap gap-1">
                  <TabsTrigger value="accounts" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-accounts">
                    <BookOpen className="w-4 h-4" />
                    <span>شجرة الحسابات</span>
                  </TabsTrigger>
                  <TabsTrigger value="funds" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-funds">
                    <Wallet className="w-4 h-4" />
                    <span>الصناديق</span>
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-journal">
                    <FileText className="w-4 h-4" />
                    <span>القيود اليومية</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-reports">
                    <BarChart3 className="w-4 h-4" />
                    <span>التقارير</span>
                  </TabsTrigger>
                  <TabsTrigger value="periods" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 rounded-xl transition-all flex gap-2 items-center text-xs" data-testid="tab-periods">
                    <Calendar className="w-4 h-4" />
                    <span>الفترات</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="accounts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AccountsManager />
              </TabsContent>
              <TabsContent value="funds" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <FundsManager />
              </TabsContent>
              <TabsContent value="journal" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <JournalEntriesManager />
              </TabsContent>
              <TabsContent value="reports" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <ReportsManager />
              </TabsContent>
              <TabsContent value="periods" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <PeriodsManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function AccountsManager() {
  const { data: accounts, isLoading } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState("asset");
  const [parentId, setParentId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/accounting/accounts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/accounts"] });
      setShowAdd(false);
      setCode("");
      setNameAr("");
      setType("asset");
      setParentId("");
      toast({ title: "تم إضافة الحساب بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/accounting/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/accounts"] });
      toast({ title: "تم حذف الحساب" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const typeLabels: Record<string, string> = {
    asset: "أصول",
    liability: "التزامات",
    equity: "حقوق ملكية",
    revenue: "إيرادات",
    expense: "مصروفات",
  };

  const typeColors: Record<string, string> = {
    asset: "bg-blue-500/20 text-blue-400",
    liability: "bg-red-500/20 text-red-400",
    equity: "bg-purple-500/20 text-purple-400",
    revenue: "bg-emerald-500/20 text-emerald-400",
    expense: "bg-orange-500/20 text-orange-400",
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  const groupedAccounts = (accounts || []).reduce((groups, account) => {
    const t = account.type;
    if (!groups[t]) groups[t] = [];
    groups[t].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">شجرة الحسابات</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2" data-testid="button-add-account">
              <Plus className="w-4 h-4" />
              إضافة حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">إضافة حساب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="رقم الحساب (مثل: 1101)" value={code} onChange={(e) => setCode(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-account-code" />
              <Input placeholder="اسم الحساب بالعربي" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-account-name" />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">أصول</SelectItem>
                  <SelectItem value="liability">التزامات</SelectItem>
                  <SelectItem value="equity">حقوق ملكية</SelectItem>
                  <SelectItem value="revenue">إيرادات</SelectItem>
                  <SelectItem value="expense">مصروفات</SelectItem>
                </SelectContent>
              </Select>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue placeholder="الحساب الأب (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون حساب أب</SelectItem>
                  {(accounts || []).map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => createMutation.mutate({ code, nameAr, type, parentId: parentId && parentId !== "none" ? Number(parentId) : null })} disabled={createMutation.isPending || !code || !nameAr} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl" data-testid="button-submit-account">
                {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(typeLabels).map(([typeKey, label]) => {
        const typeAccounts = groupedAccounts[typeKey] || [];
        if (typeAccounts.length === 0) return null;
        return (
          <Card key={typeKey} className="bg-slate-900/50 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm ${typeColors[typeKey]}`}>{label}</span>
                <span className="text-slate-400 text-sm">({typeAccounts.length} حساب)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors" data-testid={`account-row-${account.id}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2 py-1 rounded">{account.code}</span>
                      <span className="text-white">{account.nameAr}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(account.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" data-testid={`button-delete-account-${account.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FundsManager() {
  const { data: funds, isLoading } = useFunds();
  const { data: accounts } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [fundType, setFundType] = useState("cash");
  const [accountId, setAccountId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/accounting/funds", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/funds"] });
      setShowAdd(false);
      setName("");
      setFundType("cash");
      setAccountId("");
      toast({ title: "تم إضافة الصندوق بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/accounting/funds/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/funds"] });
      toast({ title: "تم حذف الصندوق" });
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">الصناديق المالية</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2" data-testid="button-add-fund">
              <Plus className="w-4 h-4" />
              إضافة صندوق
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">إضافة صندوق جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="اسم الصندوق" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-fund-name" />
              <Select value={fundType} onValueChange={setFundType}>
                <SelectTrigger className="bg-slate-800 border-white/10" data-testid="select-fund-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">صندوق نقدي</SelectItem>
                  <SelectItem value="bank">حساب بنكي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue placeholder="الحساب المحاسبي المرتبط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون ربط</SelectItem>
                  {(accounts || []).filter(a => a.type === "asset").map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => createMutation.mutate({ name, fundType, accountId: accountId && accountId !== "none" ? Number(accountId) : null })} disabled={createMutation.isPending || !name} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl" data-testid="button-submit-fund">
                {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(funds || []).map((fund) => (
          <Card key={fund.id} className="bg-slate-900/50 border-white/5" data-testid={`fund-card-${fund.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fund.fundType === "cash" ? "bg-green-500/20" : "bg-blue-500/20"}`}>
                    <Wallet className={`w-5 h-5 ${fund.fundType === "cash" ? "text-green-400" : "text-blue-400"}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{fund.name}</h4>
                    <span className="text-xs text-slate-400">{fund.fundType === "cash" ? "نقدي" : "بنكي"}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(fund.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" data-testid={`button-delete-fund-${fund.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">الرصيد</p>
                <p className="text-2xl font-bold text-emerald-400" data-testid={`text-fund-balance-${fund.id}`}>{Number(fund.balance || 0).toLocaleString("ar-YE")} ر.ي</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!funds || funds.length === 0) && (
        <div className="text-center py-12 text-slate-400">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد صناديق مالية بعد</p>
        </div>
      )}
    </div>
  );
}

function JournalEntriesManager() {
  const { data: accounts } = useAccounts();
  const { data: periods } = usePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const { data: entries, isLoading } = useJournalEntries(selectedPeriod ? Number(selectedPeriod) : undefined);
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<{ accountId: string; debit: string; credit: string; description: string }[]>([
    { accountId: "", debit: "", credit: "", description: "" },
    { accountId: "", debit: "", credit: "", description: "" },
  ]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/accounting/journal-entries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/funds"] });
      setShowAdd(false);
      setDescription("");
      setLines([
        { accountId: "", debit: "", credit: "", description: "" },
        { accountId: "", debit: "", credit: "", description: "" },
      ]);
      toast({ title: "تم إنشاء القيد بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const addLine = () => setLines([...lines, { accountId: "", debit: "", credit: "", description: "" }]);
  const removeLine = (index: number) => { if (lines.length > 2) setLines(lines.filter((_, i) => i !== index)); };
  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = () => {
    const openPeriod = (periods || []).find((p) => p.status === "open");
    createMutation.mutate({
      description,
      entryDate: new Date(entryDate),
      sourceType: "manual",
      periodId: openPeriod?.id || null,
      lines: lines.filter(l => l.accountId).map(l => ({
        accountId: Number(l.accountId),
        debit: l.debit || "0",
        credit: l.credit || "0",
        description: l.description || null,
      })),
    });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-white">القيود اليومية</h3>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-slate-800 border-white/10 w-[200px]">
              <SelectValue placeholder="جميع الفترات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفترات</SelectItem>
              {(periods || []).map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.month}/{p.year} {p.status === "closed" ? "(مقفلة)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2" data-testid="button-add-journal">
                <Plus className="w-4 h-4" />
                قيد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-white">إنشاء قيد يومي جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-entry-date" />
                  <Input placeholder="وصف القيد" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-entry-description" />
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm text-slate-400 px-1">
                    <div className="col-span-4">الحساب</div>
                    <div className="col-span-3">مدين</div>
                    <div className="col-span-3">دائن</div>
                    <div className="col-span-2"></div>
                  </div>
                  {lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2" data-testid={`journal-line-${index}`}>
                      <div className="col-span-4">
                        <Select value={line.accountId} onValueChange={(v) => updateLine(index, "accountId", v)}>
                          <SelectTrigger className="bg-slate-800 border-white/10 text-sm">
                            <SelectValue placeholder="اختر حساب" />
                          </SelectTrigger>
                          <SelectContent>
                            {(accounts || []).map((a) => (
                              <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.nameAr}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input type="number" placeholder="0" value={line.debit} onChange={(e) => updateLine(index, "debit", e.target.value)} className="bg-slate-800 border-white/10 text-sm" />
                      </div>
                      <div className="col-span-3">
                        <Input type="number" placeholder="0" value={line.credit} onChange={(e) => updateLine(index, "credit", e.target.value)} className="bg-slate-800 border-white/10 text-sm" />
                      </div>
                      <div className="col-span-2 flex items-center">
                        {lines.length > 2 && (
                          <Button variant="ghost" size="sm" onClick={() => removeLine(index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" onClick={addLine} className="text-emerald-400 hover:text-emerald-300 gap-2 w-full" data-testid="button-add-line">
                    <Plus className="w-4 h-4" />
                    إضافة سطر
                  </Button>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span>إجمالي المدين:</span>
                    <span className={`font-bold ${isBalanced ? "text-emerald-400" : "text-red-400"}`}>{totalDebit.toLocaleString("ar-YE")}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>إجمالي الدائن:</span>
                    <span className={`font-bold ${isBalanced ? "text-emerald-400" : "text-red-400"}`}>{totalCredit.toLocaleString("ar-YE")}</span>
                  </div>
                  {!isBalanced && totalDebit > 0 && (
                    <p className="text-red-400 text-xs mt-2">القيد غير متوازن - يجب أن يتساوى المدين مع الدائن</p>
                  )}
                </div>

                <Button onClick={handleSubmit} disabled={createMutation.isPending || !isBalanced || !description} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl" data-testid="button-submit-journal">
                  {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "حفظ القيد"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {(entries || []).map((entry) => (
          <Card key={entry.id} className="bg-slate-900/50 border-white/5 overflow-hidden" data-testid={`journal-entry-${entry.id}`}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
              onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
            >
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2 py-1 rounded">{entry.entryNumber}</span>
                <div>
                  <p className="text-white font-medium">{entry.description}</p>
                  <p className="text-slate-400 text-sm">{new Date(entry.entryDate).toLocaleDateString("ar-YE")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded ${entry.sourceType === "manual" ? "bg-blue-500/20 text-blue-400" : entry.sourceType === "order" ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"}`}>
                  {entry.sourceType === "manual" ? "يدوي" : entry.sourceType === "order" ? "طلب" : entry.sourceType === "closing" ? "إقفال" : entry.sourceType}
                </span>
                <span className="text-slate-300 font-bold">{Number(entry.totalDebit).toLocaleString("ar-YE")} ر.ي</span>
                {expandedEntry === entry.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {expandedEntry === entry.id && entry.lines && (
              <div className="border-t border-white/5 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-right pb-2">الحساب</th>
                      <th className="text-center pb-2">مدين</th>
                      <th className="text-center pb-2">دائن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.lines.map((line) => {
                      const account = (accounts || []).find(a => a.id === line.accountId);
                      return (
                        <tr key={line.id} className="border-t border-white/5">
                          <td className="py-2 text-white">{account ? `${account.code} - ${account.nameAr}` : `حساب #${line.accountId}`}</td>
                          <td className="py-2 text-center text-emerald-400">{Number(line.debit) > 0 ? Number(line.debit).toLocaleString("ar-YE") : "-"}</td>
                          <td className="py-2 text-center text-red-400">{Number(line.credit) > 0 ? Number(line.credit).toLocaleString("ar-YE") : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
      {(!entries || entries.length === 0) && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد قيود يومية بعد</p>
        </div>
      )}
    </div>
  );
}

function ReportsManager() {
  const { data: periods } = usePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [reportType, setReportType] = useState<"trial" | "balances">("trial");
  const { data: trialBalance, isLoading: trialLoading } = useTrialBalance(selectedPeriod ? Number(selectedPeriod) : undefined);
  const { data: accountBalances, isLoading: balancesLoading } = useAccountBalances(selectedPeriod ? Number(selectedPeriod) : undefined);

  const typeLabels: Record<string, string> = {
    asset: "أصول",
    liability: "التزامات",
    equity: "حقوق ملكية",
    revenue: "إيرادات",
    expense: "مصروفات",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-white">التقارير المالية</h3>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-slate-800 border-white/10 w-[200px]">
              <SelectValue placeholder="جميع الفترات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفترات</SelectItem>
              {(periods || []).map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.month}/{p.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
            <button onClick={() => setReportType("trial")} className={`px-4 py-2 text-sm ${reportType === "trial" ? "bg-emerald-600 text-white" : "text-slate-400"}`} data-testid="button-trial-balance">ميزان المراجعة</button>
            <button onClick={() => setReportType("balances")} className={`px-4 py-2 text-sm ${reportType === "balances" ? "bg-emerald-600 text-white" : "text-slate-400"}`} data-testid="button-account-balances">أرصدة الحسابات</button>
          </div>
        </div>
      </div>

      {reportType === "trial" && (
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              ميزان المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trialLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-right py-3">الرمز</th>
                    <th className="text-right py-3">الحساب</th>
                    <th className="text-right py-3">النوع</th>
                    <th className="text-center py-3">مدين</th>
                    <th className="text-center py-3">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {(trialBalance || []).map((row) => (
                    <tr key={row.accountId} className="border-b border-white/5 hover:bg-slate-800/30">
                      <td className="py-3 text-emerald-400 font-mono">{row.code}</td>
                      <td className="py-3 text-white">{row.nameAr}</td>
                      <td className="py-3 text-slate-400">{typeLabels[row.type] || row.type}</td>
                      <td className="py-3 text-center text-emerald-400">{Number(row.debit) > 0 ? Number(row.debit).toLocaleString("ar-YE") : "-"}</td>
                      <td className="py-3 text-center text-red-400">{Number(row.credit) > 0 ? Number(row.credit).toLocaleString("ar-YE") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-emerald-500/30 font-bold">
                    <td colSpan={3} className="py-3 text-white">الإجمالي</td>
                    <td className="py-3 text-center text-emerald-400">{(trialBalance || []).reduce((s, r) => s + Number(r.debit), 0).toLocaleString("ar-YE")}</td>
                    <td className="py-3 text-center text-red-400">{(trialBalance || []).reduce((s, r) => s + Number(r.credit), 0).toLocaleString("ar-YE")}</td>
                  </tr>
                </tfoot>
              </table>
            )}
            {(!trialBalance || trialBalance.length === 0) && !trialLoading && (
              <div className="text-center py-8 text-slate-400">لا توجد بيانات لعرضها</div>
            )}
          </CardContent>
        </Card>
      )}

      {reportType === "balances" && (
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              أرصدة الحسابات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balancesLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-right py-3">الرمز</th>
                    <th className="text-right py-3">الحساب</th>
                    <th className="text-right py-3">النوع</th>
                    <th className="text-center py-3">إجمالي مدين</th>
                    <th className="text-center py-3">إجمالي دائن</th>
                    <th className="text-center py-3">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {(accountBalances || []).map((row) => (
                    <tr key={row.accountId} className="border-b border-white/5 hover:bg-slate-800/30">
                      <td className="py-3 text-emerald-400 font-mono">{row.code}</td>
                      <td className="py-3 text-white">{row.nameAr}</td>
                      <td className="py-3 text-slate-400">{typeLabels[row.type] || row.type}</td>
                      <td className="py-3 text-center">{Number(row.totalDebit).toLocaleString("ar-YE")}</td>
                      <td className="py-3 text-center">{Number(row.totalCredit).toLocaleString("ar-YE")}</td>
                      <td className={`py-3 text-center font-bold ${Number(row.balance) >= 0 ? "text-emerald-400" : "text-red-400"}`}>{Number(row.balance).toLocaleString("ar-YE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(!accountBalances || accountBalances.length === 0) && !balancesLoading && (
              <div className="text-center py-8 text-slate-400">لا توجد بيانات لعرضها</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PeriodsManager() {
  const { data: periods, isLoading } = usePeriods();
  const [showAdd, setShowAdd] = useState(false);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [periodType, setPeriodType] = useState("monthly");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/accounting/periods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/periods"] });
      setShowAdd(false);
      toast({ title: "تم إنشاء الفترة بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const closeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/accounting/periods/${id}/close`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/periods"] });
      toast({ title: "تم إقفال الفترة بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">الفترات المحاسبية</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2" data-testid="button-add-period">
              <Plus className="w-4 h-4" />
              فترة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">إنشاء فترة محاسبية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهرية</SelectItem>
                  <SelectItem value="yearly">سنوية</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="السنة" value={year} onChange={(e) => setYear(e.target.value)} className="bg-slate-800 border-white/10" data-testid="input-period-year" />
              {periodType === "monthly" && (
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="bg-slate-800 border-white/10">
                    <SelectValue placeholder="الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={() => createMutation.mutate({
                year: Number(year),
                month: periodType === "monthly" ? Number(month) : null,
                periodType,
                status: "open"
              })} disabled={createMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl" data-testid="button-submit-period">
                {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "إنشاء"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(periods || []).map((period) => (
          <Card key={period.id} className={`border-white/5 ${period.status === "open" ? "bg-emerald-900/20 border-emerald-500/20" : "bg-slate-900/50"}`} data-testid={`period-card-${period.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${period.status === "open" ? "bg-emerald-500/20" : "bg-slate-700"}`}>
                    {period.status === "open" ? <Calendar className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      {period.periodType === "monthly" && period.month ? `${monthNames[period.month - 1]} ${period.year}` : `سنة ${period.year}`}
                    </h4>
                    <span className={`text-xs ${period.status === "open" ? "text-emerald-400" : "text-slate-400"}`}>
                      {period.status === "open" ? "مفتوحة" : "مقفلة"}
                    </span>
                  </div>
                </div>
              </div>
              {period.status === "open" && (
                <Button
                  onClick={() => closeMutation.mutate(period.id)}
                  disabled={closeMutation.isPending}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl gap-2"
                  data-testid={`button-close-period-${period.id}`}
                >
                  {closeMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <><Lock className="w-4 h-4" /> إقفال الفترة</>}
                </Button>
              )}
              {period.status === "closed" && period.closedAt && (
                <p className="text-center text-slate-400 text-xs">أُقفلت في {new Date(period.closedAt).toLocaleDateString("ar-YE")}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {(!periods || periods.length === 0) && (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد فترات محاسبية بعد</p>
        </div>
      )}
    </div>
  );
}
