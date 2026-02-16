import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Landmark, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MyOrdersModal } from "./my-orders-modal";
import { BanksModal } from "./banks-modal";

export function Navbar() {
  const { user, logout } = useAuth();
  const [showOrders, setShowOrders] = useState(false);
  const [showBanks, setShowBanks] = useState(false);

  return (
    <>
      <header className="glass rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                <ShoppingBag className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-primary to-teal-400 bg-clip-text text-transparent">
                ويب ستور
              </h1>
            </div>
          </Link>
          
          {/* Mobile User Menu Trigger could go here */}
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center w-full md:w-auto">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                className="bg-white/5 hover:bg-white/10 hover:text-primary border border-white/5 rounded-xl gap-2 text-sm h-10 px-4"
                onClick={() => setShowOrders(true)}
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">طلباتي</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="bg-white/5 hover:bg-white/10 hover:text-teal-400 border border-white/5 rounded-xl gap-2 text-sm h-10 px-4"
                onClick={() => setShowBanks(true)}
              >
                <Landmark className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">البنوك</span>
              </Button>

              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    className="bg-white/5 hover:bg-white/10 hover:text-purple-400 border border-white/5 rounded-xl gap-2 text-sm h-10 px-4"
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>الإدارة</span>
                  </Button>
                </Link>
              )}

              <Button 
                variant="ghost" 
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl gap-2 text-sm h-10 px-4"
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

      <MyOrdersModal open={showOrders} onOpenChange={setShowOrders} />
      <BanksModal open={showBanks} onOpenChange={setShowBanks} />
    </>
  );
}
