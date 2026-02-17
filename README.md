# ويب ستور - حزمة النشر الخارجي الكاملة

## محتويات الحزمة

```
external-deploy/
├── index.cjs              ← ملف السيرفر المجمّع (جاهز للتشغيل)
├── package.json           ← قائمة المتطلبات
├── .env.example           ← نموذج الإعدادات
├── setup.sh               ← سكريبت الإعداد التلقائي (Linux/Mac)
├── setup.bat              ← سكريبت الإعداد التلقائي (Windows)
├── database-full-backup.sql    ← نسخة قاعدة البيانات الكاملة (هيكل + بيانات)
├── database-schema-only.sql    ← هيكل قاعدة البيانات فقط (بدون بيانات)
├── public/                ← ملفات الواجهة الأمامية المبنية
│   ├── index.html
│   ├── assets/
│   └── images/
├── uploads/               ← الصور المرفوعة (إيصالات، شعارات)
├── source/                ← الكود المصدري الكامل (للتعديل والتطوير)
│   ├── client/            ← كود الواجهة الأمامية (React)
│   ├── server/            ← كود السيرفر (Express)
│   ├── shared/            ← الملفات المشتركة (schema + routes)
│   ├── attached_assets/   ← الصور والملفات المرفقة
│   └── ...
└── README.md              ← هذا الملف
```

## المتطلبات
- **Node.js** الإصدار 18 أو أحدث
- **PostgreSQL** قاعدة بيانات (الإصدار 13 أو أحدث)

---

## الطريقة 1: الإعداد التلقائي (الأسهل)

### Linux / Mac:
```bash
chmod +x setup.sh
./setup.sh
```

### Windows:
انقر مرتين على `setup.bat`

---

## الطريقة 2: الإعداد اليدوي

### 1. رفع الملفات
ارفع محتويات هذا المجلد بالكامل إلى السيرفر الخارجي.

### 2. تثبيت المتطلبات
```bash
npm install
```

### 3. إعداد قاعدة البيانات
أنشئ قاعدة بيانات PostgreSQL جديدة:
```bash
createdb webstore
```

### 4. استيراد قاعدة البيانات
لاستيراد البيانات الكاملة (مستخدمين، طلبات، خدمات، إلخ):
```bash
psql postgresql://username:password@localhost:5432/webstore < database-full-backup.sql
```

أو لاستيراد الهيكل فقط (بدون بيانات - بداية نظيفة):
```bash
psql postgresql://username:password@localhost:5432/webstore < database-schema-only.sql
```

### 5. إعداد المتغيرات البيئية
انسخ ملف الإعدادات:
```bash
cp .env.example .env
```
ثم عدّل ملف `.env` وضع القيم الصحيحة:
- `DATABASE_URL` - رابط الاتصال بقاعدة البيانات
- `SESSION_SECRET` - مفتاح سري عشوائي (غيّره لقيمة طويلة)
- `PORT` - رقم المنفذ (افتراضي: 5000)

### 6. تشغيل التطبيق
```bash
npm start
```

التطبيق سيعمل على `http://localhost:5000`

---

## ملاحظات مهمة

- **مجلد uploads**: يحتوي على الصور المرفوعة (إيصالات الإيداع، صور الإعلانات). تأكد أن المجلد لديه صلاحيات الكتابة.
- **مجلد public**: يحتوي على ملفات الواجهة الأمامية المبنية. لا تعدّله.
- **مجلد source**: يحتوي على الكود المصدري الكامل إذا أردت التعديل وإعادة البناء.
- **index.cjs**: ملف السيرفر الرئيسي المجمّع - هذا هو الملف الذي يشغّل التطبيق.

---

## تشغيل كخدمة دائمة

### باستخدام PM2 (الأسهل):
```bash
npm install -g pm2
pm2 start index.cjs --name webstore
pm2 save
pm2 startup
```

### باستخدام systemd (Linux):
أنشئ ملف `/etc/systemd/system/webstore.service`:
```ini
[Unit]
Description=WebStore App
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/external-deploy
ExecStart=/usr/bin/node index.cjs
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=DATABASE_URL=postgresql://user:pass@localhost:5432/webstore
Environment=SESSION_SECRET=your-secret-key

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable webstore
sudo systemctl start webstore
```

---

## إعداد Nginx كـ Reverse Proxy (موصى به للإنتاج)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## إعادة بناء المشروع من الكود المصدري

إذا أردت تعديل الكود وإعادة البناء:

```bash
cd source
npm install
npm run build
```

ثم انسخ الملفات المبنية:
```bash
cp dist/index.cjs ../
cp -r dist/public ../
```

---

## معلومات الحسابات الافتراضية

عند استيراد قاعدة البيانات الكاملة، ستجد الحسابات الموجودة مسبقاً.
إذا استخدمت الهيكل فقط، ستحتاج لإنشاء حساب جديد من صفحة التسجيل.
أول حساب يمكن ترقيته لمدير من قاعدة البيانات:
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```
