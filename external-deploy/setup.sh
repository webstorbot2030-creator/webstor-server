#!/bin/bash

echo "============================================"
echo "   ويب ستور - سكريبت الإعداد التلقائي"
echo "   WebStore - Automatic Setup Script"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js 18+ أولاً"
    echo "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ يجب استخدام Node.js 18 أو أحدث. الإصدار الحالي: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) موجود"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  تحذير: psql غير موجود. تأكد من توفر قاعدة بيانات PostgreSQL"
fi

# Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📋 تم إنشاء ملف .env من النموذج"
        echo "⚠️  يرجى تعديل ملف .env وتحديث قيم الاتصال بقاعدة البيانات"
        echo ""
        read -p "هل قمت بتعديل ملف .env؟ (y/n): " answer
        if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
            echo "يرجى تعديل ملف .env أولاً ثم أعد تشغيل هذا السكريبت"
            exit 1
        fi
    else
        echo "❌ ملف .env.example غير موجود"
        exit 1
    fi
fi

# Load env vars
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL غير محدد في ملف .env"
    exit 1
fi
echo "✅ DATABASE_URL موجود"

# Install dependencies
echo ""
echo "📦 جاري تثبيت المتطلبات..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ فشل تثبيت المتطلبات"
    exit 1
fi
echo "✅ تم تثبيت المتطلبات بنجاح"

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
echo "✅ تم إنشاء مجلد uploads"

# Import database
echo ""
echo "📊 جاري إعداد قاعدة البيانات..."
read -p "هل تريد استيراد البيانات الكاملة؟ (y=كاملة / n=الهيكل فقط): " db_choice

if [ "$db_choice" = "y" ] || [ "$db_choice" = "Y" ]; then
    psql "$DATABASE_URL" < database-full-backup.sql 2>&1
    echo "✅ تم استيراد قاعدة البيانات الكاملة (هيكل + بيانات)"
else
    psql "$DATABASE_URL" < database-schema-only.sql 2>&1
    echo "✅ تم استيراد هيكل قاعدة البيانات فقط"
fi

echo ""
echo "============================================"
echo "   ✅ تم الإعداد بنجاح!"
echo "============================================"
echo ""
echo "لتشغيل التطبيق:"
echo "  npm start"
echo ""
echo "التطبيق سيعمل على: http://localhost:${PORT:-5000}"
echo ""
echo "لتشغيل كخدمة دائمة (باستخدام PM2):"
echo "  npm install -g pm2"
echo "  pm2 start index.cjs --name webstore"
echo ""
