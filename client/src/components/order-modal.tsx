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
import { useSettings, useServiceGroups } from "@/hooks/use-store";

const orderSchema = z.object({
  userInputId: z.string().min(1, "هذا الحقل مطلوب"),
});

interface OrderModalProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderModal({ service, open, onOpenChange }: OrderModalProps) {
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const { data: groups } = useServiceGroups();

  const currentGroup = groups?.find((g: any) => g.id === service?.serviceGroupId);
  const isAuthInput = currentGroup?.inputType === 'auth';

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

    if (!service) return;

    createOrder(
      { serviceId: service.id, userInputId: data.userInputId },
      {
        onSuccess: () => {
          setSuccess(true);
          form.reset();
          
          // Redirect to WhatsApp if setting exists
          if (settings?.adminWhatsapp) {
            const message = `طلب جديد من ويب ستور\n------------------\nالخدمة: ${service.name}\nالمعرف: ${data.userInputId}\nالسعر: ${service.price} ر.ي\nاسم العميل: ${user.fullName}\nرقم الهاتف: ${user.phoneNumber}`;
            const whatsappUrl = `https://wa.me/${settings.adminWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }
        },
      }
    );
  };

  // Reset state when closing/opening
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setTimeout(() => setSuccess(false), 300); // Reset after anim
    }
    onOpenChange(val);
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass bg-slate-900/90 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span>تم استلام طلبك!</span>
              </>
            ) : (
              <span>طلب خدمة: {service.name}</span>
            )}
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
            
            {settings?.adminWhatsapp && (
              <Button 
                onClick={() => {
                  const message = `تأكيد طلب من ويب ستور\n------------------\nالخدمة: ${service.name}\nالمعرف: ${form.getValues().userInputId || 'تم الإرسال مسبقاً'}\nالسعر: ${service.price} ر.ي\nاسم العميل: ${user?.fullName}\nرقم الهاتف: ${user?.phoneNumber}`;
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-primary text-sm">تفاصيل الخدمة</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {service.note || "سيتم شحن الحساب فور التحقق من عملية الدفع."}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <span className="text-gray-400">السعر المطلوب</span>
                <span className="text-xl font-bold text-teal-400">{service.price} ر.ي</span>
              </div>

              <FormField
                control={form.control}
                name="userInputId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isAuthInput ? "البريد الإلكتروني وكلمة المرور" : "الآيدي / الرقم / المعرف"}</FormLabel>
                    <FormControl>
                      {isAuthInput ? (
                        <textarea
                          placeholder="مثلاً:&#10;example@mail.com&#10;password123"
                          {...field}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary p-3 min-h-[100px] outline-none"
                        />
                      ) : (
                        <Input 
                          placeholder="أدخل المعرف الخاص بك هنا..." 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary h-12"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary transition-all duration-300 shadow-lg shadow-primary/20"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  "تأكيد الطلب"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
