import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config'; // برای خواندن از .env

const app = express();
const port = process.env.PORT || 3000;

// اضافه کردن CORS برای اجازه به دامنه خاص (ifixcompany.com)
const corsOptions = {
  origin: 'https://ifixcompany.com',  // اینجا URL وبسایت خودت رو بزار
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));  // اینجا CORS با تنظیمات جدید استفاده شده
app.use(bodyParser.json());

// استفاده از کلیدها از .env
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:example@example.com',
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post('/send', async (req, res) => {
  const payload = JSON.stringify(req.body);
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  res.json({ message: 'Push notifications processed.', results });
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
