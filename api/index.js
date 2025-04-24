// Credit by - @SudoR2spr WOODcraft
import axios from 'axios';
import FormData from 'form-data';

// Keep the repository private and add your details. OK
const CONFIG = {
  BOT_TOKEN: '7632867723:AAHTIl6E4kweDPtiujkQzRYKxrTfJGmZpbQ',
  PUBLICKEY: 'public_q4N61YFX+/wDC2nUNa+5QOSx+4Y=',
  VERCEL_URL: 'https://imgbb-image-uploader.vercel.app'
};

const TELEGRAM_API = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;
const STICKER_ID = "CAACAgQAAxkBAAEMzLJm483R53GzjAHmbr3ms3iOFSlTqAADFAAClt1hUHmPWNO7Sd_YNgQ";

// Simple in-memory storage
const userStats = new Map();

const sendStickerWithDelete = async (chat_id, delay = 5000) => {
  try {
    const { data } = await axios.post(`${TELEGRAM_API}/sendSticker`, {
      chat_id,
      sticker: STICKER_ID
    });
    setTimeout(() => {
      axios.post(`${TELEGRAM_API}/deleteMessage`, {
        chat_id,
        message_id: data.result.message_id
      }).catch(console.error);
    }, delay);
  } catch (error) {
    console.error('Sticker send failed:', error.response?.data || error.message);
  }
};

const sendMessageWithDelete = async (chat_id, text, extra = {}, delay = 10000) => {
  try {
    const { data } = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id,
      text,
      parse_mode: 'Markdown',
      ...extra
    });
    setTimeout(() => {
      axios.post(`${TELEGRAM_API}/deleteMessage`, {
        chat_id,
        message_id: data.result.message_id
      }).catch(console.error);
    }, delay);
  } catch (error) {
    console.error('Message send failed:', error.response?.data || error.message);
  }
};

(async () => {
  try {
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: `${CONFIG.VERCEL_URL}/api/webhook`,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true
    });
    console.log('✅ Webhook configured:', response.data);
  } catch (error) {
    console.error('❌ Webhook setup failed:', error.response?.data || error.message);
  }
})();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Telegram ImgBB Bot',
      endpoints: {
        webhook: `${CONFIG.VERCEL_URL}/api/webhook`,
        health: `${CONFIG.VERCEL_URL}/`
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;

  const sendMessage = async (chat_id, text, extra = {}) => {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id,
        text,
        parse_mode: 'Markdown',
        ...extra
      });
    } catch (error) {
      console.error('Message send failed:', error.response?.data || error.message);
    }
  };

  const BUTTONS = {
    start: {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📤 Upload Image", callback_data: "upload_help" }],
          [
            { text: "🌟 Premium", url: "https://t.me/paidtechzone" },
            { text: "ℹ️ Help", callback_data: "help" }
          ]
        ]
      }
    },
    uploadSuccess: (imageUrl) => ({
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔗 View Image", url: imageUrl },
            { text: "🔄 Upload Another", callback_data: "upload_another" }
          ],
          [
            { text: "📊 Stats", callback_data: "stats" },
            { text: "⭐ Rate Us", url: "https://t.me/paidtechzone" }
          ]
        ]
      }
    }),
    help: {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 Guide", url: "https://t.me/tcronebNet" },
            { text: "💬 Support", url: "https://t.me/paidtechzone" }
          ]
        ]
      }
    }
  };

  if (body.message?.text === '/start') {
    const name = body.message.from.first_name || 'User';
    await sendMessage(body.message.chat.id,
      `✨ *Welcome ${name}!* ✨\n\n` +
      `I can upload your photos to ImgBB instantly.\n\n` +
      `✅ *How to use:*\n` +
      `1. Send me an image\n` +
      `2. I'll upload to ImgBB\n` +
      `3. Get your direct link\n\n` +
      `⚡ *Fast, free and easy!*`,
      BUTTONS.start
    );
    return res.status(200).send('OK');
  }

  if (body.message?.photo) {
    const chatId = body.message.chat.id;
    const fileId = body.message.photo.slice(-1)[0].file_id;

    try {
      await sendMessage(chatId, "⏳ *Processing your image...*");

      const { data: fileData } = await axios.get(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
      const fileUrl = `https://api.telegram.org/file/bot${CONFIG.BOT_TOKEN}/${fileData.result.file_path}`;

      const { data: imageData } = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageData).toString('base64');

      const form = new FormData();
      form.append('key', CONFIG.IMGBB_API_KEY);
      form.append('image', base64Image);

      const { data: uploadData } = await axios.post('https://upload.imagekit.io/api/v1/files/upload', form, {
        headers: form.getHeaders()
      });

      // Save stats
      const sizeKB = Math.round(uploadData.data.size / 1024);
      const userId = chatId;
      const current = userStats.get(userId) || { uploads: 0, totalSize: 0 };
      userStats.set(userId, {
        uploads: current.uploads + 1,
        totalSize: current.totalSize + sizeKB
      });

      await sendMessage(chatId,
        `✅ *Upload Successful!*\n\n` +
        `🔗 [Direct Link](${uploadData.data.url})\n` +
        `📏 Dimensions: ${uploadData.data.width}x${uploadData.data.height}\n` +
        `📦 Size: ${sizeKB} KB`,
        BUTTONS.uploadSuccess(uploadData.data.url)
      );
    } catch (error) {
      console.error('Upload failed:', error);
      await sendMessage(chatId, "❌ *Upload Failed!*\nPlease try another image.");
    }
    return res.status(200).send('OK');
  }

  if (body.callback_query) {
    const chatId = body.callback_query.message.chat.id;
    const data = body.callback_query.data;

    await sendStickerWithDelete(chatId);

    switch (data) {
      case 'upload_help':
        await sendMessageWithDelete(chatId, "📤 Simply send me an image to upload!");
        break;
      case 'upload_another':
        await sendMessageWithDelete(chatId, "🔄 Ready for your next upload!", BUTTONS.start);
        break;
      case 'stats':
        const stat = userStats.get(chatId) || { uploads: 0, totalSize: 0 };
        await sendMessageWithDelete(chatId,
          `📊 *Your Stats*\n\n` +
          `📁 Uploads: ${stat.uploads}\n` +
          `📦 Total Size: ${stat.totalSize} KB`);
        break;
      case 'help':
        await sendMessageWithDelete(chatId, "ℹ️ Need help? Here are resources:", BUTTONS.help);
        break;
    }
    return res.status(200).send('OK');
  }

  if (body.message?.text) {
    await sendMessage(body.message.chat.id,
      "📌 Please send me an *image* to upload.\nUse /start for instructions.",
      BUTTONS.start
    );
    return res.status(200).send('OK');
  }

  res.status(200).send('OK');
      }
