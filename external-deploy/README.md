# ويب ستور - دليل النشر الخارجي

## المتطلبات
- **Node.js** الإصدار 18 أو أحدث
- **PostgreSQL** قاعدة بيانات (الإصدار 13 أو أحدث)

## خطوات التثبيت

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

### 4. إعداد المتغيرات البيئية
انسخ ملف الإعدادات:
```bash
cp .env.example .env
```
ثم عدّل ملف `.env` وضع القيم الصحيحة:
- `DATABASE_URL` - رابط الاتصال بقاعدة البيانات
- `SESSION_SECRET` - مفتاح سري عشوائي
- `PORT` - رقم المنفذ (افتراضي: 5000)

### 5. تشغيل التطبيق
```bash
npm start
```

التطبيق سيعمل على `http://localhost:5000` (أو المنفذ الذي حددته).

### 6. إنشاء جداول قاعدة البيانات
عند أول تشغيل، الجداول ستُنشأ تلقائياً.

---

## ملاحظات مهمة

- **مجلد uploads**: يحتوي على الصور المرفوعة (إيصالات الإيداع، صور الإعلانات، إلخ). تأكد أن المجلد لديه صلاحيات الكتابة.
- **مجلد public**: يحتوي على ملفات الواجهة الأمامية المبنية.
- **index.cjs**: ملف السيرفر الرئيسي المجمّع.

## تشغيل كخدمة (اختياري)

### باستخدام PM2:
```bash
npm install -g pm2
pm2 start index.cjs --name webstore
pm2 save
pm2 startup
```

### باستخدام systemd:
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

ثم:
```bash
sudo systemctl enable webstore
sudo systemctl start webstore
```

## استخدام Nginx كـ Reverse Proxy (اختياري)

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
