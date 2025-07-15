import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// تنظیمات CORS فقط برای دامنه مشخص
const corsOptions = {
  origin: 'https://ifixcompany.com', // دامنه سایت خودت رو اینجا وارد کن
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

// کلیدهای VAPID از متغیرهای محیطی
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:your-email@example.com', // ایمیل خودت رو اینجا بزن
  publicVapidKey,
  privateVapidKey
);

let subscriptions = []; // آرایه مشترکین پوش

// ثبت اشتراک‌ها
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  const exists = subscriptions.find(
    (sub) => JSON.stringify(sub) === JSON.stringify(subscription)
  );
  if (!exists) {
    subscriptions.push(subscription);
  }
  res.status(201).json({});
});

// ارسال نوتیفیکیشن به همه مشترکین
app.post('/send', async (req, res) => {
  const payload = JSON.stringify(req.body);
  try {
    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub, payload))
    );

    // حذف مشترکینی که ارسال بهشون موفق نبوده
    subscriptions = subscriptions.filter((_, i) => results[i].status === 'fulfilled');

    res.json({ message: 'Push notifications sent.', results });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Error sending notifications' });
  }
});

// مسیر وب‌هوک برای دریافت سفارشات از وردپرس
app.post('/webhook', (req, res) => {
  const eventData = req.body;

  // ساخت پیام نوتیفیکیشن شامل شماره سفارش، نام مشتری و مبلغ کل سفارش
  const notificationPayload = {
    title: 'سفارش جدید',
    body: `سفارش شماره ${eventData.order_id} توسط ${eventData.customer_name} ثبت شد. مبلغ کل: ${eventData.total_price} تومان.`,
    data: eventData,
  };

  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, JSON.stringify(notificationPayload)).catch((err) => {
      console.error('Failed to send notification to a subscriber:', err);
    });
  });

  res.status(200).json({ received: true });
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
