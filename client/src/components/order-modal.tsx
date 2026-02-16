import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrder } from "@/hooks/use-orders";
import { Service, ServiceGroup } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Info, Loader2, CheckCircle2, MessageSquare, Wallet } from "lucide-react";
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
  const groupServices = services?.filter((s: any) => s.serviceGroupId === serviceGroup?.id) || [];

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
            const message = `🛒 طلب جديد من ويب ستور\n══════════════════\n📦 القسم: ${serviceGroup!.name}\n🎮 الخدمة: ${selectedService.name}\n🆔 المعرف: ${data.userInputId}\n💰 السعر: ${selectedService.price.toLocaleString()} ر.ي\n══════════════════\n👤 اسم العميل: ${user.fullName}\n${user.phoneNumber ? '📱 رقم الهاتف: ' + user.phoneNumber : '📧 البريد: ' + ((user as any).email || '')}\n✅ تم الخصم من الرصيد`;
            const whatsappUrl = `https://wa.me/${settings.adminWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }
        },
        onError: (error: any) => {
          toast({
            title: "فشل تقديم الطلب",
            description: error.message || "رصيدك غير كافي",
            variant: "destructive",
          });
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
      <DialogContent className="dark:bg-slate-900 bg-white dark:border-white/10 border-gray-200 dark:text-white text-gray-900 sm:max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-sm">
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
            <p className="dark:text-gray-300 text-gray-600">
              تم إرسال طلبك بنجاح وسيتم تنفيذه في أقرب وقت. يمكنك متابعة حالة الطلب من قائمة "طلباتي".
            </p>
            
            {settings?.adminWhatsapp && selectedService && (
              <Button 
                onClick={() => {
                  const message = `🛒 تأكيد طلب من ويب ستور\n══════════════════\n📦 القسم: ${serviceGroup?.name}\n🎮 الخدمة: ${selectedService.name}\n🆔 المعرف: ${form.getValues().userInputId || 'تم الإرسال مسبقاً'}\n💰 السعر: ${selectedService.price.toLocaleString()} ر.ي\n══════════════════\n👤 اسم العميل: ${user?.fullName}\n${user?.phoneNumber ? '📱 رقم الهاتف: ' + user.phoneNumber : '📧 البريد: ' + ((user as any)?.email || '')}`;
                  const whatsappUrl = `https://wa.me/${settings.adminWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }} 
                className="w-full bg-green-600 hover:bg-green-700 mt-2 gap-2 text-white"
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
            <div className="dark:bg-slate-800/50 bg-blue-50 border dark:border-blue-900/50 border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <span className="dark:text-gray-200 text-gray-700 font-medium">
                {isAuthInput ? "الشحن عن طريق الحساب" : "الشحن عن طريق الآيدي"}
              </span>
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {groupServices.map((s: any) => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedService?.id === s.id 
                      ? 'dark:bg-slate-800 bg-orange-50 border-orange-500' 
                      : 'dark:bg-slate-800/30 bg-gray-50 dark:border-white/5 border-gray-200 dark:hover:border-white/10 hover:border-gray-300'
                  }`}
                >
                  {selectedService?.id === s.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-full" />
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-white text-gray-900 text-lg">{s.name}</span>
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
                      <FormLabel className="dark:text-gray-300 text-gray-700 font-bold">
                        {isAuthInput ? "البريد الإلكتروني وكلمة المرور" : "الآيدي أو الرقم"}
                      </FormLabel>
                      <FormControl>
                        {isAuthInput ? (
                          <textarea
                            placeholder="أدخل تفاصيل الحساب هنا..."
                            {...field}
                            className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-white/10 border-gray-200 rounded-xl dark:text-white text-gray-900 dark:placeholder:text-gray-600 placeholder:text-gray-400 focus:border-orange-500 p-3 min-h-[80px] outline-none"
                          />
                        ) : (
                          <Input 
                            placeholder="أدخل الآيدي الخاص بك هنا" 
                            {...field} 
                            className="dark:bg-slate-800 bg-gray-50 dark:border-white/10 border-gray-200 dark:text-white text-gray-900 dark:placeholder:text-gray-600 placeholder:text-gray-400 focus:border-orange-500 h-12"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {user && selectedService && (
                  <div className={`flex items-center gap-3 rounded-xl p-4 ${
                    (user.balance || 0) >= selectedService.price 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <Wallet className={`w-5 h-5 ${(user.balance || 0) >= selectedService.price ? 'text-green-500' : 'text-red-500'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${(user.balance || 0) >= selectedService.price ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        رصيدك: {(user.balance || 0).toLocaleString()} ر.ي
                      </p>
                      {(user.balance || 0) < selectedService.price && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">رصيدك غير كافي لإتمام هذا الطلب</p>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 text-xl font-bold bg-orange-500 hover:bg-orange-600 transition-all rounded-xl shadow-lg shadow-orange-500/20 gap-2 text-white"
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