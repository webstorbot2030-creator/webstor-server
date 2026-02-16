import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrder } from "@/hooks/use-orders";
import { Service } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Info, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useServiceGroups, useServices } from "@/hooks/use-store";

const orderSchema = z.object({
  userInputId: z.string().min(1, "هذا الحقل مطلوب"),
});

interface OrderModalProps {
  serviceGroup: ServiceGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderModal({ serviceGroup, open, onOpenChange }: OrderModalProps) {
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const { data: services } = useServices();
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const isAuthInput = serviceGroup?.inputType === 'auth';
  const groupServices = services?.filter(s => s.serviceGroupId === serviceGroup?.id) || [];

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userInputId: "",
    },
  });

  const onSubmit = (data: z.infer<typeof orderSchema>) => {
    if (!user) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول لإتمام الطلب",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    if (!selectedService) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار الفئة المطلوبة أولاً",
        variant: "destructive",
      });
      return;
    }

    createOrder(
      { serviceId: selectedService.id, userInputId: data.userInputId },
      {
        onSuccess: () => {
          setSuccess(true);
          form.reset();
          
          if (settings?.adminWhatsapp) {
            const message = `طلب جديد من ويب ستور\n------------------\nالخدمة: ${selectedService.name}\nالمعرف: ${data.userInputId}\nالسعر: ${selectedService.price} ر.ي\nاسم العميل: ${user.fullName}\nرقم الهاتف: ${user.phoneNumber}`;
            const whatsappUrl = `https://wa.me/${settings.adminWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }
        },
      }
    );
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setTimeout(() => {
        setSuccess(false);
        setSelectedService(null);
      }, 300);
    }
    onOpenChange(val);
  };

  if (!serviceGroup) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass bg-slate-900 border-white/10 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-500 text-center">
            {serviceGroup.name}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-gray-300">
              تم إرسال طلبك بنجاح وسيتم تنفيذه في أقرب وقت. يمكنك متابعة حالة الطلب من قائمة "طلباتي".
            </p>
            
            {settings?.adminWhatsapp && selectedService && (
              <Button 
                onClick={() => {
                  const message = `تأكيد طلب من ويب ستور\n------------------\nالخدمة: ${selectedService.name}\nالمعرف: ${form.getValues().userInputId || 'تم الإرسال مسبقاً'}\nالسعر: ${selectedService.price} ر.ي\nاسم العميل: ${user?.fullName}\nرقم الهاتف: ${user?.phoneNumber}`;
                  const whatsappUrl = `https://wa.me/${settings.adminWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }} 
                className="w-full bg-green-600 hover:bg-green-700 mt-2 gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                مراسلة المدير عبر واتساب
              </Button>
            )}

            <Button onClick={() => handleOpenChange(false)} variant="outline" className="w-full mt-2">
              إغلاق
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Instruction */}
            <div className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-200 font-medium">
                {isAuthInput ? "الشحن عن طريق الحساب" : "الشحن عن طريق الآيدي"}
              </span>
              <Info className="w-5 h-5 text-blue-400" />
            </div>

            {/* Price Tiers List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {groupServices.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedService?.id === s.id 
                      ? 'bg-slate-800 border-orange-500' 
                      : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                  }`}
                >
                  {selectedService?.id === s.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-full" />
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-lg">{s.name}</span>
                    <span className="font-bold text-orange-500 text-lg">{s.price} ريال</span>
                  </div>
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userInputId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-bold">
                        {isAuthInput ? "البريد الإلكتروني وكلمة المرور" : "الآيدي أو الرقم"}
                      </FormLabel>
                      <FormControl>
                        {isAuthInput ? (
                          <textarea
                            placeholder="أدخل تفاصيل الحساب هنا..."
                            {...field}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-orange-500 p-3 min-h-[80px] outline-none"
                          />
                        ) : (
                          <Input 
                            placeholder="أدخل الآيدي الخاص بك هنا" 
                            {...field} 
                            className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500 h-12"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 text-xl font-bold bg-orange-500 hover:bg-orange-600 transition-all rounded-xl shadow-lg shadow-orange-500/20 gap-2"
                  disabled={isPending || !selectedService}
                >
                  {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5 -scale-x-100" />
                      تأكيد الطلب
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
