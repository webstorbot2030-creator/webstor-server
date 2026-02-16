import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Landmark, Settings, LogOut, User as UserIcon, Bell, Check, CheckCheck, Trash2, Wallet, Sun, Moon, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { MyOrdersModal } from "./my-orders-modal";
import { BanksModal } from "./banks-modal";
import { useSettings } from "@/hooks/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTheme } from "@/hooks/use-theme";

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { data: settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showOrders, setShowOrders] = useState(false);
  const [showBanks, setShowBanks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const qc = useQueryClient();
  const prevCountRef = useRef(0);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const current = unreadCount?.count || 0;
    if (current > prevCountRef.current && prevCountRef.current >= 0) {
      playNotificationSound();
    }
    prevCountRef.current = current;
  }, [unreadCount?.count]);

  const { data: notifs } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user && showNotifications,
  });

  const { data: vipGroup } = useQuery<any>({
    queryKey: ["/api/vip-group/my"],
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("POST", `/api/notifications/${id}/read`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/notifications/read-all"); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const deleteNotifMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/notifications/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const typeColors: Record<string, string> = {
    success: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20",
    error: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20",
    info: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20",
    order: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20",
  };

  const count = unreadCount?.count || 0;
  const isNegativeBalance = (user?.balance || 0) < 0;

  return (
    <>
      <header className="glass rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src={settings?.logoUrl || "/logo-default.png"} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
              <h1 className="text-2xl font-bold bg-gradient-to-l from-primary to-teal-400 bg-clip-text text-transparent">
                {settings?.storeName || "ويب ستور"}
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center w-full md:w-auto">
          <Button
            variant="ghost"
            className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 border dark:border-white/5 border-gray-200 rounded-xl text-sm h-10 w-10 p-0"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>

          {user ? (
            <>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 border dark:border-white/5 border-gray-200 rounded-xl text-sm h-10 w-10 p-0 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  data-testid="button-notifications"
                >
                  <Bell className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  {count > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="badge-notification-count">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute left-0 md:right-0 md:left-auto top-12 w-80 md:w-96 dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-hidden flex flex-col" data-testid="notification-panel">
                      <div className="flex items-center justify-between p-4 border-b dark:border-white/5 border-gray-100">
                        <h3 className="font-bold dark:text-white text-gray-900 text-sm">الإشعارات</h3>
                        {count > 0 && (
                          <Button variant="ghost" size="sm" className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-400 h-7" onClick={() => markAllReadMutation.mutate()} data-testid="button-mark-all-read">
                            <CheckCheck className="w-3 h-3 ml-1" />
                            قراءة الكل
                          </Button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {(!notifs || notifs.length === 0) ? (
                          <div className="p-8 text-center dark:text-slate-500 text-gray-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            لا توجد إشعارات
                          </div>
                        ) : (
                          notifs.map((n: any) => (
                            <div key={n.id} className={`p-3 border-b dark:border-white/5 border-gray-100 dark:hover:bg-white/5 hover:bg-gray-50 transition-colors ${!n.isRead ? 'dark:bg-blue-500/5 bg-blue-50' : ''}`} data-testid={`notification-item-${n.id}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-blue-400' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[n.type] || typeColors.info}`}>
                                      {n.type === 'success' ? 'نجاح' : n.type === 'error' ? 'خطأ' : n.type === 'order' ? 'طلب' : 'معلومة'}
                                    </Badge>
                                    <span className="text-[10px] dark:text-slate-500 text-gray-400">{n.createdAt ? format(new Date(n.createdAt), "MM/dd HH:mm") : ""}</span>
                                  </div>
                                  <p className="text-xs font-semibold dark:text-white text-gray-900">{n.title}</p>
                                  <p className="text-xs dark:text-slate-400 text-gray-500 mt-0.5 truncate">{n.message}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  {!n.isRead && (
                                    <Button variant="ghost" size="icon" className="w-6 h-6 text-blue-500 dark:text-blue-400 hover:text-blue-400" onClick={() => markReadMutation.mutate(n.id)} data-testid={`button-read-${n.id}`}>
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="w-6 h-6 text-red-500 dark:text-red-400 hover:text-red-400" onClick={() => deleteNotifMutation.mutate(n.id)} data-testid={`button-delete-notif-${n.id}`}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button 
                variant="ghost" 
                className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 hover:text-primary border dark:border-white/5 border-gray-200 rounded-xl gap-2 text-sm h-10 px-4"
                onClick={() => setShowOrders(true)}
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline dark:text-gray-300 text-gray-700">طلباتي</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 hover:text-teal-500 border dark:border-white/5 border-gray-200 rounded-xl gap-2 text-sm h-10 px-4"
                onClick={() => setShowBanks(true)}
              >
                <Landmark className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                <span className="hidden sm:inline dark:text-gray-300 text-gray-700">تغذية حسابك</span>
              </Button>

              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 hover:text-purple-500 border dark:border-white/5 border-gray-200 rounded-xl gap-2 text-sm h-10 px-4"
                  >
                    <Settings className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span className="dark:text-gray-300 text-gray-700">الإدارة</span>
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-1">
                {vipGroup?.name && (
                  <span className="bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 text-[10px] px-2 py-1 rounded-full font-bold border border-yellow-500/20" data-testid="badge-vip-group">
                    <Crown className="w-3 h-3 inline ml-1" />{vipGroup.name}
                  </span>
                )}
                <div className={`${isNegativeBalance ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/20' : 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-teal-500/20'} border rounded-xl px-3 h-10 flex items-center gap-2 text-sm`} data-testid="text-user-balance">
                  <Wallet className={`w-4 h-4 ${isNegativeBalance ? 'text-red-500 dark:text-red-400' : 'text-teal-500 dark:text-teal-400'}`} />
                  <span className={`font-bold ${isNegativeBalance ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>{(user.balance || 0).toLocaleString()}</span>
                  <span className={`text-xs ${isNegativeBalance ? 'text-red-600 dark:text-red-500' : 'text-teal-600 dark:text-teal-500'}`}>ر.ي</span>
                  <button onClick={() => qc.invalidateQueries({ queryKey: ["/api/user"] })} className={`${isNegativeBalance ? 'text-red-400 hover:text-red-300' : 'text-teal-400 hover:text-teal-300'} transition-colors`} data-testid="button-refresh-balance">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  className="dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 hover:text-cyan-500 border dark:border-white/5 border-gray-200 rounded-xl gap-2 text-sm h-10 px-4"
                  data-testid="button-profile"
                >
                  <UserIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span className="hidden sm:inline dark:text-gray-300 text-gray-700">حسابي</span>
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 rounded-xl gap-2 text-sm h-10 px-4"
                onClick={() => logout.mutate()}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 px-6 shadow-lg shadow-primary/20">
                <UserIcon className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {settings?.maintenanceEnabled && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 mb-4 text-center text-yellow-600 dark:text-yellow-400 text-sm font-bold">
          ⚠️ النظام تحت الصيانة - {settings.maintenanceMessage || "يرجى المحاولة لاحقاً"}
        </div>
      )}

      <MyOrdersModal open={showOrders} onOpenChange={setShowOrders} />
      <BanksModal open={showBanks} onOpenChange={setShowBanks} />
    </>
  );
}