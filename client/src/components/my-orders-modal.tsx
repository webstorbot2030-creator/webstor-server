import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMyOrders } from "@/hooks/use-orders";
import { Loader2, Package, Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface MyOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-yellow-500/20" },
  processing: { label: "قيد التنفيذ", color: "bg-blue-500/20 text-blue-600 dark:text-blue-500 border-blue-500/20" },
  completed: { label: "مكتمل", color: "bg-green-500/20 text-green-600 dark:text-green-500 border-green-500/20" },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-600 dark:text-red-500 border-red-500/20" },
};

export function MyOrdersModal({ open, onOpenChange }: MyOrdersModalProps) {
  const { data: orders, isLoading } = useMyOrders();
  const [search, setSearch] = useState("");

  const filteredOrders = orders?.filter((o: any) => 
    o.userInputId.includes(search) || 
    o.service.name.includes(search) ||
    o.id.toString().includes(search)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-slate-900/95 bg-white dark:border-white/10 border-gray-200 dark:text-white text-gray-900 sm:max-w-2xl max-h-[85vh] flex flex-col backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Package className="w-6 h-6" />
            سجل طلباتي
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="بحث برقم الطلب أو اسم الخدمة..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dark:bg-white/5 bg-gray-50 dark:border-white/10 border-gray-200 pr-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order: any) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <div key={order.id} className="dark:bg-white/5 bg-gray-50 rounded-xl p-4 border dark:border-white/5 border-gray-200 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold dark:text-white text-gray-900">{order.service.name}</h4>
                      <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                        {format(new Date(order.createdAt!), "yyyy-MM-dd hh:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className={`${status.color} border`}>
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm dark:bg-black/20 bg-gray-100 p-3 rounded-lg">
                    <div>
                      <span className="dark:text-gray-500 text-gray-400 block text-xs">رقم الطلب</span>
                      <span className="font-mono dark:text-gray-300 text-gray-700">#{order.id}</span>
                    </div>
                    <div>
                      <span className="dark:text-gray-500 text-gray-400 block text-xs">المعرف المدخل</span>
                      <span className="font-mono dark:text-gray-300 text-gray-700">{order.userInputId}</span>
                    </div>
                  </div>

                  {order.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-600 dark:text-red-300">
                      <span className="font-bold block text-xs mb-1">سبب الرفض:</span>
                      {order.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 dark:text-gray-500 text-gray-400">
              لا توجد طلبات سابقة
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}