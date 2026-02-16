import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 rtl" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8 text-slate-400 hover:text-white"
          data-testid="button-back-home"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمتجر
        </Button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-8">
          <h1 className="text-3xl font-bold text-white">الشروط والأحكام</h1>
          <p className="text-slate-400 text-sm">آخر تحديث: فبراير 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. القبول بالشروط</h2>
            <p className="text-slate-300 leading-relaxed">
              باستخدامك لمنصة ويب ستور، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. طبيعة الخدمات</h2>
            <p className="text-slate-300 leading-relaxed">
              ويب ستور هي منصة لبيع الخدمات الرقمية تشمل شحن الألعاب، بطاقات التطبيقات، والاشتراكات الرقمية. جميع المنتجات المعروضة هي خدمات رقمية وليست سلعاً مادية.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. التسجيل والحساب</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
              <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
              <li>يحق لنا تعليق أو إلغاء أي حساب يخالف هذه الشروط</li>
              <li>يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام المنصة</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. الطلبات والدفع</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>جميع الأسعار معروضة بالريال اليمني (YER)</li>
              <li>يتم تأكيد الطلب بعد التحقق من الدفع</li>
              <li>تأكد من صحة معرف اللاعب أو بيانات الحساب قبل تقديم الطلب</li>
              <li>لا يمكن تعديل الطلب بعد تقديمه</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. سياسة الاسترداد</h2>
            <p className="text-slate-300 leading-relaxed">
              نظراً لطبيعة الخدمات الرقمية، لا يمكن استرداد المبالغ المدفوعة بعد تنفيذ الطلب بنجاح. في حالة فشل تنفيذ الطلب أو وجود خطأ من جانبنا، سيتم إعادة المبلغ إلى رصيد حسابك في المنصة.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. المسؤولية</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>لا نتحمل مسؤولية الأخطاء في المعرفات أو البيانات المدخلة من قبل المستخدم</li>
              <li>لا نتحمل مسؤولية أي إجراءات تتخذها الشركات المزودة للخدمات تجاه حسابات المستخدمين</li>
              <li>نسعى لتقديم خدمة مستمرة لكن لا نضمن عدم انقطاع الخدمة</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. الاستخدام المحظور</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>استخدام المنصة لأغراض غير قانونية</li>
              <li>محاولة اختراق أو التلاعب بأنظمة المنصة</li>
              <li>إنشاء حسابات متعددة بهدف التحايل</li>
              <li>إعادة بيع الخدمات بدون إذن مسبق</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. التعديلات</h2>
            <p className="text-slate-300 leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إعلام المستخدمين بأي تغييرات جوهرية عبر المنصة.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. التواصل</h2>
            <p className="text-slate-300 leading-relaxed">
              لأي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر واتساب أو من خلال القنوات المتاحة في المتجر.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
