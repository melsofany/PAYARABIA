# PAYARABIA API Documentation

## نظرة عامة

API الخاص بمنصة PAYARABIA يوفر واجهة برمجية شاملة لإدارة المحافظ الرقمية، المعاملات المالية، والدعم الفني.

**Base URL**: `https://api.payarabia.com/api`

## المصادقة

جميع الطلبات المحمية تتطلب رمز JWT في header:

```
Authorization: Bearer <your_jwt_token>
```

## رموز الاستجابة

| الكود | المعنى |
|-------|--------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | خطأ في البيانات المرسلة |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 500 | خطأ في الخادم |

## المصادقة والتسجيل

### تسجيل مستخدم جديد
```http
POST /auth/register
```

**Body:**
```json
{
  "fullName": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "password": "password123",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "isVerified": false,
      "status": "pending"
    }
  }
}
```

### تسجيل الدخول
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "jwt_token_here",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "isVerified": true,
      "status": "active",
      "wallet": {
        "balance": 1000.50,
        "currency": "SAR"
      }
    }
  }
}
```

### تسجيل الخروج
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "message": "تم تسجيل الخروج بنجاح"
}
```

### تفعيل البريد الإلكتروني
```http
GET /auth/verify-email/:token
```

**Response:**
```json
{
  "status": "success",
  "message": "تم تفعيل الحساب بنجاح"
}
```

### نسيان كلمة المرور
```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "ahmed@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
}
```

### إعادة تعيين كلمة المرور
```http
PATCH /auth/reset-password/:token
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "new_jwt_token",
  "data": {
    "user": { ... }
  }
}
```

## المحفظة والمعاملات

### الحصول على الرصيد
```http
GET /wallet/balance
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "sarBalance": 1000.50,
    "usdtBalance": 150.25,
    "usdtAddress": "0x1234...5678"
  }
}
```

### تحويل الأموال
```http
POST /wallet/transfer
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "recipientId": "recipient_user_id",
  "amount": 100.00,
  "currency": "SAR",
  "description": "تحويل مبلغ"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionNumber": "TXN-20240115-000001",
      "type": "transfer",
      "amount": 100.00,
      "currency": "SAR",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### الحصول على تاريخ المعاملات
```http
GET /wallet/transactions?page=1&limit=20
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد العناصر في الصفحة (افتراضي: 20)
- `type`: نوع المعاملة (deposit, withdrawal, transfer, exchange)
- `status`: حالة المعاملة (pending, completed, failed)

**Response:**
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "transactionNumber": "TXN-20240115-000001",
        "type": "transfer",
        "amount": 100.00,
        "currency": "SAR",
        "status": "completed",
        "description": "تحويل مبلغ",
        "recipientName": "سارة أحمد",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### تحويل العملة
```http
POST /wallet/exchange
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "fromCurrency": "SAR",
  "toCurrency": "USDT",
  "amount": 1000.00
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction_id",
      "type": "exchange",
      "fromCurrency": "SAR",
      "toCurrency": "USDT",
      "fromAmount": 1000.00,
      "toAmount": 266.67,
      "exchangeRate": 3.75,
      "status": "completed"
    }
  }
}
```

### الحصول على أسعار الصرف
```http
GET /wallet/exchange-rates
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "rates": [
      {
        "fromCurrency": "SAR",
        "toCurrency": "USD",
        "rate": 0.2667,
        "lastUpdated": "2024-01-15T10:00:00Z"
      },
      {
        "fromCurrency": "SAR",
        "toCurrency": "USDT",
        "rate": 0.2667,
        "lastUpdated": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

## الدعم الفني

### إنشاء تذكرة دعم
```http
POST /support/tickets
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "subject": "مشكلة في تحويل الأموال",
  "message": "لم يتم تحويل المبلغ بنجاح",
  "category": "financial",
  "priority": "high"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "ticketNumber": "TK-2024-001",
      "subject": "مشكلة في تحويل الأموال",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### الحصول على قائمة التذاكر
```http
GET /support/tickets?page=1&limit=20
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: رقم الصفحة
- `limit`: عدد العناصر في الصفحة
- `status`: حالة التذكرة (open, in_progress, resolved, closed)
- `priority`: الأولوية (low, medium, high, urgent)

**Response:**
```json
{
  "status": "success",
  "data": {
    "tickets": [
      {
        "id": "ticket_id",
        "ticketNumber": "TK-2024-001",
        "subject": "مشكلة في تحويل الأموال",
        "status": "open",
        "priority": "high",
        "createdAt": "2024-01-15T10:30:00Z",
        "lastMessage": "لم يتم تحويل المبلغ بنجاح"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### الحصول على تفاصيل التذكرة
```http
GET /support/tickets/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "ticketNumber": "TK-2024-001",
      "subject": "مشكلة في تحويل الأموال",
      "message": "لم يتم تحويل المبلغ بنجاح",
      "status": "open",
      "priority": "high",
      "category": "financial",
      "messages": [
        {
          "id": "message_id",
          "message": "لم يتم تحويل المبلغ بنجاح",
          "senderType": "user",
          "senderName": "أحمد محمد",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### إضافة رسالة للتذكرة
```http
POST /support/tickets/:id/messages
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "message": "شكراً لمساعدتكم"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": {
      "id": "message_id",
      "message": "شكراً لمساعدتكم",
      "senderType": "user",
      "senderName": "أحمد محمد",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### بدء مكالمة صوتية
```http
POST /support/voice-call/initiate
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "ticketId": "ticket_id"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "call": {
      "callId": "call_id",
      "channelName": "channel_name",
      "token": "agora_token",
      "status": "initiated"
    }
  }
}
```

### إنهاء المكالمة الصوتية
```http
POST /support/voice-call/:callId/end
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "message": "تم إنهاء المكالمة بنجاح"
}
```

## الملف الشخصي

### الحصول على الملف الشخصي
```http
GET /user/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "dateOfBirth": "1990-01-01",
      "isVerified": true,
      "status": "active",
      "profile": {
        "avatar": "avatar_url",
        "address": {
          "street": "شارع الملك فهد",
          "city": "الرياض",
          "region": "منطقة الرياض",
          "country": "SA"
        }
      },
      "wallet": {
        "balance": 1000.50,
        "currency": "SAR"
      },
      "usdtWallet": {
        "address": "0x1234...5678",
        "balance": 150.25
      }
    }
  }
}
```

### تحديث الملف الشخصي
```http
PATCH /user/profile
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "fullName": "أحمد محمد الجديد",
  "profile": {
    "address": {
      "street": "شارع الملك عبدالعزيز",
      "city": "جدة",
      "region": "منطقة مكة المكرمة"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

## رفع الملفات

### رفع صورة الملف الشخصي
```http
POST /user/upload-avatar
```

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `avatar`: ملف الصورة

**Response:**
```json
{
  "status": "success",
  "data": {
    "avatar": "https://cloudinary.com/avatar_url"
  }
}
```

## أخطاء شائعة

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "البيانات المرسلة غير صحيحة",
  "errors": [
    {
      "field": "email",
      "message": "البريد الإلكتروني غير صحيح"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "لم تقم بتسجيل الدخول! يرجى تسجيل الدخول للوصول."
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "تم حظر حسابك. يرجى التواصل مع الدعم الفني."
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "المورد المطلوب غير موجود"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "حدث خطأ في الخادم"
}
```

## Rate Limiting

- **100 طلب** لكل 15 دقيقة لكل IP
- **50 طلب** عادي، ثم تأخير 500ms لكل طلب إضافي
- Headers المضافة:
  - `X-RateLimit-Limit`: الحد الأقصى للطلبات
  - `X-RateLimit-Remaining`: الطلبات المتبقية
  - `X-RateLimit-Reset`: وقت إعادة تعيين العداد

## SDKs والمكتبات

### JavaScript/Node.js
```bash
npm install payarabia-sdk
```

```javascript
const Payarabia = require('payarabia-sdk');
const client = new Payarabia({
  apiKey: 'your_api_key',
  environment: 'sandbox' // or 'production'
});

// تسجيل الدخول
const user = await client.auth.login('email', 'password');

// تحويل الأموال
const transaction = await client.wallet.transfer({
  recipientId: 'recipient_id',
  amount: 100,
  currency: 'SAR'
});
```

### Flutter/Dart
```yaml
dependencies:
  payarabia_flutter: ^1.0.0
```

```dart
import 'package:payarabia_flutter/payarabia_flutter.dart';

final client = PayarabiaClient(
  apiKey: 'your_api_key',
  environment: Environment.sandbox,
);

// تسجيل الدخول
final user = await client.auth.login('email', 'password');

// تحويل الأموال
final transaction = await client.wallet.transfer(
  recipientId: 'recipient_id',
  amount: 100,
  currency: 'SAR',
);
```

## الدعم والمساعدة

- **البريد الإلكتروني**: api-support@payarabia.com
- **الوثائق التفاعلية**: https://api.payarabia.com/docs
- **GitHub**: https://github.com/payarabia/api-examples
- **Discord**: https://discord.gg/payarabia