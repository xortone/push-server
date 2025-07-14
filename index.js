import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config'; // اضافه شد برای خواندن .env

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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
