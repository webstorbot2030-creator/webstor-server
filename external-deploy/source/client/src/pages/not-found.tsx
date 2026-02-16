import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background rtl" dir="rtl">
      <Card className="w-full max-w-md mx-4 bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-red-500 items-center justify-center">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">404 الصفحة غير موجودة</h1>
          <p className="text-gray-400 text-center mb-6">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90">العودة للرئيسية</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
