# دليل إعداد مشروع PAYARABIA

## متطلبات النظام

### متطلبات عامة
- **Node.js**: 16.0.0 أو أحدث
- **npm**: 8.0.0 أو أحدث
- **MongoDB**: 5.0 أو أحدث
- **Redis**: 6.0 أو أحدث (اختياري للتخزين المؤقت)
- **Git**: 2.0 أو أحدث

### لتطبيق Flutter
- **Flutter SDK**: 3.0.0 أو أحدث
- **Dart**: 2.17.0 أو أحدث
- **Android Studio**: 2022.1 أو أحدث
- **Xcode**: 14.0 أو أحدث (للتطوير على iOS)

### لتطبيق React.js
- **React**: 18.0.0 أو أحدث
- **Node.js**: 16.0.0 أو أحدث

## إعداد البيئة المحلية

### 1. استنساخ المشروع

```bash
# استنساخ المستودع
git clone https://github.com/your-username/payarabia-project.git
cd payarabia-project

# إنشاء فرع جديد للتطوير
git checkout -b feature/your-feature-name
```

### 2. إعداد قاعدة البيانات

#### MongoDB
```bash
# تثبيت MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# تثبيت MongoDB (macOS)
brew install mongodb-community

# تثبيت MongoDB (Windows)
# قم بتحميل MongoDB من الموقع الرسمي

# تشغيل MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
# أو استخدم MongoDB Compass للواجهة الرسومية
```

#### Redis (اختياري)
```bash
# تثبيت Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# تثبيت Redis (macOS)
brew install redis

# تشغيل Redis
sudo systemctl start redis-server  # Linux
brew services start redis  # macOS
```

### 3. إعداد الخادم (Backend)

```bash
cd backend

# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تعديل ملف .env
nano .env
```

#### إعداد متغيرات البيئة

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/payarabia

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration (Gmail)
EMAIL_FROM=noreply@payarabia.com
EMAIL_USERNAME=your_gmail_username
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Blockchain Configuration
USDT_NETWORK=BEP20
USDT_CONTRACT_ADDRESS=0x55d398326f99059ff775485246999027b3197955
BSC_RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=your_private_key_for_blockchain_operations

# Voice Call Configuration (Agora)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

#### تشغيل الخادم

```bash
# وضع التطوير
npm run dev

# أو وضع الإنتاج
npm start
```

الخادم سيعمل على: `http://localhost:5000`
الوثائق التفاعلية: `http://localhost:5000/api-docs`

### 4. إعداد تطبيق الإدارة (Admin App)

```bash
cd admin-app

# تثبيت التبعيات
npm install

# إنشاء ملف البيئة
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# تشغيل التطبيق
npm start
```

التطبيق سيعمل على: `http://localhost:3001`

### 5. إعداد تطبيق المستخدمين (User App)

```bash
cd user-app

# تثبيت التبعيات
flutter pub get

# تشغيل التطبيق
flutter run
```

## إعداد الخدمات الخارجية

### 1. Gmail (للإيميلات)

1. قم بتفعيل المصادقة الثنائية في حساب Gmail
2. أنشئ كلمة مرور خاصة للتطبيقات
3. استخدم كلمة المرور هذه في `EMAIL_PASSWORD`

### 2. Twilio (للرسائل النصية)

1. سجل حساب في [Twilio](https://www.twilio.com/)
2. احصل على `Account SID` و `Auth Token`
3. احصل على رقم هاتف Twilio
4. أضف هذه المعلومات في ملف `.env`

### 3. Stripe (للمدفوعات)

1. سجل حساب في [Stripe](https://stripe.com/)
2. احصل على المفاتيح من لوحة التحكم
3. أضف المفاتيح في ملف `.env`

### 4. Agora (للمكالمات الصوتية)

1. سجل حساب في [Agora](https://www.agora.io/)
2. أنشئ مشروع جديد
3. احصل على `App ID` و `App Certificate`
4. أضف هذه المعلومات في ملف `.env`

### 5. Cloudinary (لرفع الملفات)

1. سجل حساب في [Cloudinary](https://cloudinary.com/)
2. احصل على معلومات الحساب من لوحة التحكم
3. أضف هذه المعلومات في ملف `.env`

## إعداد قاعدة البيانات

### 1. إنشاء البيانات التجريبية

```bash
cd backend

# تشغيل سكريبت البيانات التجريبية
npm run seed
```

### 2. إنشاء مستخدم إداري

```bash
# استخدام MongoDB Shell
mongo payarabia

# إنشاء مستخدم إداري
db.admins.insertOne({
  fullName: "مدير النظام",
  email: "admin@payarabia.com",
  password: "$2a$12$encrypted_password_here",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## اختبار التثبيت

### 1. اختبار الخادم

```bash
# اختبار endpoint الصحة
curl http://localhost:5000/health

# النتيجة المتوقعة
{
  "status": "success",
  "message": "PAYARABIA API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 2. اختبار تسجيل مستخدم جديد

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "password": "password123",
    "dateOfBirth": "1990-01-01"
  }'
```

### 3. اختبار تطبيق الإدارة

1. افتح `http://localhost:3001`
2. يجب أن تظهر صفحة تسجيل الدخول
3. استخدم بيانات المستخدم الإداري

### 4. اختبار تطبيق Flutter

```bash
cd user-app

# تشغيل الاختبارات
flutter test

# تشغيل التطبيق على محاكي
flutter run
```

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ في الاتصال بقاعدة البيانات
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**الحل:**
- تأكد من تشغيل MongoDB
- تحقق من صحة `MONGODB_URI` في ملف `.env`

#### 2. خطأ في JWT
```
Error: jwt malformed
```

**الحل:**
- تأكد من صحة `JWT_SECRET` في ملف `.env`
- تأكد من إرسال الرمز بشكل صحيح في header

#### 3. خطأ في CORS
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**الحل:**
- تأكد من إضافة URL التطبيق في إعدادات CORS في `app.js`

#### 4. خطأ في Flutter
```
Error: No pubspec.yaml file found
```

**الحل:**
- تأكد من وجودك في مجلد `user-app`
- قم بتشغيل `flutter pub get`

### سجلات الأخطاء

#### الخادم
```bash
# عرض سجلات الخادم
cd backend
npm run dev

# أو استخدام PM2
pm2 logs payarabia-api
```

#### قاعدة البيانات
```bash
# سجلات MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

#### تطبيق Flutter
```bash
# سجلات Flutter
flutter logs
```

## النشر

### 1. النشر على Heroku

```bash
# تثبيت Heroku CLI
npm install -g heroku

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create payarabia-api

# إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_production_jwt_secret

# نشر التطبيق
git push heroku main
```

### 2. النشر على Vercel (تطبيق الإدارة)

```bash
# تثبيت Vercel CLI
npm install -g vercel

# نشر التطبيق
cd admin-app
vercel --prod
```

### 3. النشر على Google Play Store (تطبيق Flutter)

```bash
cd user-app

# بناء APK للإنتاج
flutter build apk --release

# أو بناء App Bundle
flutter build appbundle --release
```

## الصيانة

### 1. نسخ احتياطي لقاعدة البيانات

```bash
# إنشاء نسخة احتياطية
mongodump --db payarabia --out /backup/payarabia-$(date +%Y%m%d)

# استعادة النسخة الاحتياطية
mongorestore --db payarabia /backup/payarabia-20240115
```

### 2. مراقبة الأداء

```bash
# مراقبة استخدام الذاكرة
pm2 monit

# مراقبة سجلات الأخطاء
pm2 logs --err

# إعادة تشغيل التطبيق
pm2 restart payarabia-api
```

### 3. تحديث التبعيات

```bash
# تحديث تبعيات الخادم
cd backend
npm update

# تحديث تبعيات تطبيق الإدارة
cd admin-app
npm update

# تحديث تبعيات Flutter
cd user-app
flutter pub upgrade
```

## الدعم

إذا واجهت أي مشاكل في الإعداد:

1. **تحقق من الوثائق**: راجع هذا الدليل بعناية
2. **ابحث في Issues**: تحقق من المشاكل المعروفة في GitHub
3. **اطلب المساعدة**: أنشئ issue جديد في GitHub
4. **تواصل معنا**: support@payarabia.com

---

**نصائح مهمة:**
- احتفظ بنسخة احتياطية من ملف `.env`
- لا تشارك مفاتيح API مع أي شخص
- استخدم بيئة منفصلة للتطوير والإنتاج
- راقب سجلات الأخطاء بانتظام