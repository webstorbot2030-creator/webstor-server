import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white">سياسة الخصوصية</h1>
          <p className="text-slate-400 text-sm">آخر تحديث: فبراير 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. المقدمة</h2>
            <p className="text-slate-300 leading-relaxed">
              نحن في ويب ستور نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. المعلومات التي نجمعها</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>الاسم الكامل ورقم الهاتف عند التسجيل</li>
              <li>معلومات الطلبات والمعاملات المالية</li>
              <li>معرفات الألعاب والتطبيقات المدخلة عند الشراء</li>
              <li>بيانات تسجيل الدخول (كلمة المرور مشفرة)</li>
              <li>عنوان IP وبيانات الجلسة لأغراض أمنية</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. كيفية استخدام المعلومات</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>تنفيذ الطلبات وتقديم الخدمات الرقمية</li>
              <li>التواصل معك بخصوص طلباتك وحسابك</li>
              <li>تحسين خدماتنا وتجربة المستخدم</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
              <li>حماية أمن المنصة ومنع الاحتيال</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. حماية البيانات</h2>
            <p className="text-slate-300 leading-relaxed">
              نستخدم تقنيات تشفير متقدمة لحماية بياناتك. يتم تشفير كلمات المرور باستخدام خوارزميات آمنة ولا يمكن الوصول إليها بشكلها الأصلي. نحتفظ بجلسات المستخدمين بشكل آمن في قاعدة بيانات محمية.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. مشاركة البيانات</h2>
            <p className="text-slate-300 leading-relaxed">
              لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك معلومات محدودة مع مزودي الخدمات الرقمية لتنفيذ طلباتك فقط (مثل معرف اللاعب لشحن الألعاب).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. حقوقك</h2>
            <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
              <li>طلب الوصول إلى بياناتك الشخصية</li>
              <li>طلب تصحيح أو تحديث معلوماتك</li>
              <li>طلب حذف حسابك وبياناتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. التواصل</h2>
            <p className="text-slate-300 leading-relaxed">
              لأي استفسارات تتعلق بالخصوصية، يمكنك التواصل معنا عبر واتساب أو من خلال القنوات المتاحة في المتجر.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
