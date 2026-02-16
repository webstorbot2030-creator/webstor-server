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
      <DialogContent className="glass bg-slate-900/95 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-teal-400 flex items-center gap-2">
            <Landmark className="w-6 h-6" />
            الحسابات البنكية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {banks?.map((bank) => (
            <div key={bank.id} className="bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
              
              <h4 className="text-lg font-bold text-teal-400 mb-2">{bank.bankName}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-xs text-gray-500 block">اسم الحساب</span>
                    <span className="text-sm font-medium">{bank.accountName}</span>
                  </div>
                </div>

                <div 
                  className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-black/40 transition-colors group"
                  onClick={() => copyToClipboard(bank.accountNumber, bank.id)}
                >
                  <div>
                    <span className="text-xs text-gray-500 block">رقم الحساب</span>
                    <span className="text-lg font-mono tracking-wider font-bold text-white">{bank.accountNumber}</span>
                  </div>
                  <div className="text-gray-500 group-hover:text-teal-400 transition-colors">
                    {copiedId === bank.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              
              {bank.note && (
                <p className="text-xs text-gray-400 mt-3 border-t border-white/5 pt-2">
                  * {bank.note}
                </p>
              )}
            </div>
          ))}

          {(!banks || banks.length === 0) && (
             <div className="text-center py-8 text-gray-500">
               لا توجد حسابات بنكية مضافة حالياً
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
