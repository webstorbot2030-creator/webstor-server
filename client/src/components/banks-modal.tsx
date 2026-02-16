import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBanks } from "@/hooks/use-store";
import { Landmark, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BanksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BanksModal({ open, onOpenChange }: BanksModalProps) {
  const { data: banks } = useBanks();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "تم نسخ رقم الحساب" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-slate-900/95 bg-white dark:border-white/10 border-gray-200 dark:text-white text-gray-900 sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-teal-500 dark:text-teal-400 flex items-center gap-2">
            <Landmark className="w-6 h-6" />
            الحسابات البنكية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {banks?.map((bank: any) => (
            <div key={bank.id} className="dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border dark:border-white/10 border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
              
              <h4 className="text-lg font-bold text-teal-500 dark:text-teal-400 mb-2">{bank.bankName}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center dark:bg-black/30 bg-gray-50 p-3 rounded-lg border dark:border-white/5 border-gray-200">
                  <div>
                    <span className="text-xs dark:text-gray-500 text-gray-400 block">اسم الحساب</span>
                    <span className="text-sm font-medium dark:text-white text-gray-900">{bank.accountName}</span>
                  </div>
                </div>

                <div 
                  className="flex justify-between items-center dark:bg-black/30 bg-gray-50 p-3 rounded-lg border dark:border-white/5 border-gray-200 cursor-pointer dark:hover:bg-black/40 hover:bg-gray-100 transition-colors group"
                  onClick={() => copyToClipboard(bank.accountNumber, bank.id)}
                >
                  <div>
                    <span className="text-xs dark:text-gray-500 text-gray-400 block">رقم الحساب</span>
                    <span className="text-lg font-mono tracking-wider font-bold dark:text-white text-gray-900">{bank.accountNumber}</span>
                  </div>
                  <div className="dark:text-gray-500 text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                    {copiedId === bank.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              
              {bank.note && (
                <p className="text-xs dark:text-gray-400 text-gray-500 mt-3 border-t dark:border-white/5 border-gray-200 pt-2">
                  * {bank.note}
                </p>
              )}
            </div>
          ))}

          {(!banks || banks.length === 0) && (
             <div className="text-center py-8 dark:text-gray-500 text-gray-400">
               لا توجد حسابات بنكية مضافة حالياً
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}