import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config'; // برای خواندن از .env

const app = express();
const port = process.env.PORT || 3000;  // پورت به طور خودکار در محیط‌های cloud تنظیم می‌شود

// اضافه کردن CORS برای اجازه به دامنه خاص (ifixcompany.com)
const corsOptions = {
  origin: 'https://ifixcompany.com',  // اینجا URL وبسایت خودت رو بزار
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));  // اینجا CORS با تنظیمات جدید استفاده شده
app.use(bodyParser.json());  // برای پردازش درخواست‌های JSON

// استفاده از کلیدها از .env
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:example@example.com',  // ایمیل خود را اینجا وارد کن
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];  // آرایه‌ای برای ذخیره مشترکین

// ثبت مشترکین
app.post('/subscribe', (req, res) => {
  const subscription = req.body;  // دریافت اطلاعات اشتراک
  subscriptions.push(subscription);  // اضافه کردن به لیست مشترکین
  res.status(201).json({});  // پاسخ موفق
});

// ارسال نوتیفیکیشن
app.post('/send', async (req, res) => {
  const payload = JSON.stringify(req.body);  // محتوای نوتیفیکیشن
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))  // ارسال نوتیفیکیشن به تمام مشترکین
  );
  res.json({ message: 'Push notifications processed.', results });  // پاسخ به کلاینت
});

// شروع به کار سرور
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
