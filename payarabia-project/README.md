# PAYARABIA - منصة الدفع الرقمي

PAYARABIA هي منصة دفع رقمية متكاملة مصممة خصيصاً للسوق العربي، تقدم خدمات محافظ رقمية آمنة، تحويلات سريعة، وتحويل عملات رقمية.

## المميزات الرئيسية

### للمستخدمين
- **محفظة رقمية آمنة**: إدارة الأموال بسهولة وأمان
- **تحويلات فورية**: إرسال واستقبال الأموال بسرعة
- **تحويل العملات**: تحويل بين الريال السعودي والعملات الرقمية
- **دعم USDT**: تداول العملات الرقمية على شبكة BEP20
- **دعم فني متاح 24/7**: مكالمات صوتية وتذاكر دعم
- **واجهة عربية**: تصميم مخصص للغة العربية

### للإدارة
- **لوحة تحكم شاملة**: إدارة المستخدمين والمعاملات
- **نظام دعم متقدم**: تتبع وإدارة تذاكر الدعم
- **تقارير مالية**: إحصائيات مفصلة عن المعاملات
- **إدارة العملات**: تحديث أسعار الصرف والعمولات
- **مكالمات صوتية**: دعم مباشر للمستخدمين

## التقنيات المستخدمة

### Frontend
- **Flutter**: تطبيق المستخدمين (Android/iOS)
- **React.js**: تطبيق الإدارة (Web)
- **SAP UI5**: مكونات واجهة المستخدم للإدارة

### Backend
- **Node.js**: خادم API
- **Express.js**: إطار العمل
- **MongoDB**: قاعدة البيانات
- **JWT**: المصادقة
- **Socket.io**: التواصل المباشر

### الخدمات الخارجية
- **Agora**: المكالمات الصوتية
- **Twilio**: الرسائل النصية
- **Stripe**: معالجة المدفوعات
- **Cloudinary**: رفع الملفات
- **Web3**: العملات الرقمية

## هيكل المشروع

```
payarabia-project/
├── user-app/                 # تطبيق Flutter للمستخدمين
│   ├── lib/
│   │   ├── models/          # نماذج البيانات
│   │   ├── services/        # خدمات API
│   │   ├── screens/         # شاشات التطبيق
│   │   ├── widgets/         # مكونات مخصصة
│   │   └── utils/           # أدوات مساعدة
│   └── assets/              # الأصول (صور، خطوط)
├── admin-app/               # تطبيق React.js للإدارة
│   ├── src/
│   │   ├── components/      # مكونات React
│   │   ├── pages/           # صفحات التطبيق
│   │   ├── services/        # خدمات API
│   │   └── styles/          # ملفات التنسيق
│   └── public/              # الملفات العامة
├── backend/                 # خادم Node.js
│   ├── controllers/         # متحكمات API
│   ├── models/              # نماذج قاعدة البيانات
│   ├── routes/              # مسارات API
│   ├── middleware/          # البرمجيات الوسيطة
│   ├── services/            # الخدمات الخارجية
│   └── utils/               # أدوات مساعدة
├── database/                # قاعدة البيانات
│   ├── migrations/          # ترحيل البيانات
│   └── seeds/               # بيانات تجريبية
└── docs/                    # الوثائق
    ├── api.md               # وثائق API
    └── setup.md             # دليل الإعداد
```

## متطلبات النظام

### تطبيق Flutter
- Flutter SDK 3.0+
- Dart 2.17+
- Android Studio / VS Code
- Android SDK / Xcode

### تطبيق React.js
- Node.js 16+
- npm 8+
- React 18+

### الخادم
- Node.js 16+
- MongoDB 5+
- Redis 6+

## التثبيت والإعداد

### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/payarabia-project.git
cd payarabia-project
```

### 2. إعداد الخادم
```bash
cd backend
npm install
cp .env.example .env
# قم بتعديل ملف .env بالقيم المناسبة
npm run dev
```

### 3. إعداد تطبيق الإدارة
```bash
cd admin-app
npm install
npm start
```

### 4. إعداد تطبيق المستخدمين
```bash
cd user-app
flutter pub get
flutter run
```

## متغيرات البيئة

### الخادم (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payarabia
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
```

### تطبيق الإدارة (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - الحصول على بيانات المستخدم

### المحفظة
- `GET /api/wallet/balance` - الحصول على الرصيد
- `POST /api/wallet/transfer` - تحويل الأموال
- `GET /api/wallet/transactions` - تاريخ المعاملات
- `POST /api/wallet/exchange` - تحويل العملة

### الدعم
- `POST /api/support/tickets` - إنشاء تذكرة دعم
- `GET /api/support/tickets` - قائمة التذاكر
- `POST /api/support/voice-call/initiate` - بدء مكالمة صوتية

## الأمان

- **تشفير كلمات المرور**: باستخدام bcrypt
- **JWT Tokens**: للمصادقة الآمنة
- **Rate Limiting**: منع الهجمات
- **Data Sanitization**: تنظيف البيانات المدخلة
- **HTTPS**: تشفير الاتصالات
- **2FA**: المصادقة الثنائية (قريباً)

## الاختبار

```bash
# اختبار الخادم
cd backend
npm test

# اختبار تطبيق Flutter
cd user-app
flutter test
```

## النشر

### الخادم
```bash
# استخدام PM2
npm install -g pm2
pm2 start app.js --name payarabia-api
```

### تطبيق الإدارة
```bash
npm run build
# رفع ملفات build إلى خادم الويب
```

### تطبيق Flutter
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

- **البريد الإلكتروني**: support@payarabia.com
- **الهاتف**: +966501234567
- **الموقع**: https://payarabia.com

## خريطة الطريق

### المرحلة الأولى (مكتملة)
- [x] نظام المصادقة والتسجيل
- [x] المحفظة الرقمية الأساسية
- [x] تحويلات الأموال
- [x] نظام الدعم الفني

### المرحلة الثانية (قيد التطوير)
- [ ] تحويل العملات الرقمية
- [ ] المكالمات الصوتية
- [ ] التطبيق المحمول
- [ ] لوحة الإدارة

### المرحلة الثالثة (مخططة)
- [ ] المصادقة الثنائية
- [ ] التكامل مع البنوك
- [ ] برنامج الولاء
- [ ] API للمطورين

---

**PAYARABIA** - مستقبل الدفع الرقمي في المنطقة العربية 🚀