# Telegram Imgbb Image Uploader Bot 🤖📸

A powerful Telegram bot that automatically uploads images to ImgBB and returns direct links.

## ✨ Features
- Instant image upload to ImgBB
- Auto-deletion of temporary messages
- User statistics tracking
- Interactive buttons for easy navigation
- Supports both photos and documents
- Supports sticker message
- Free and easy to use

## 🚀 Deployment

### Prerequisites
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- ImgBB API key from [imgbb.com](https://api.imgbb.com)
- Vercel account

### Steps
1. **Fork this repository**
2. **Create new Vercel project**
   - Go to [Vercel](https://vercel.com)
   - Import your forked repository
3. **Set environment variables**
   - `BOT_TOKEN`: Your Telegram bot token
   - `IMGBB_API_KEY`: Your ImgBB API key
4. **Deploy**
5. **Set webhook**
   - After deployment, set webhook to:  
     `https://your-app-name.vercel.app/api/webhook`

## ⚙️ Configuration
Edit these values in the code:
```javascript
const CONFIG = {
  BOT_TOKEN: 'your_bot_token_here',
  IMGBB_API_KEY: 'your_imgbb_api_key_here',
  VERCEL_URL: 'your_vercel_app_url_here'
};
```


## 🤖 How to Use
1. Start the bot with `/start` command
2. Send any image (as photo or file)
3. Get your ImgBB link instantly!

## 📊 Commands
- `/start` - Show welcome message
- Any image - Upload to ImgBB

## 🔗 Support
- [Support Group](https://t.me/Opleech_WD)
- [User Guide](https://t.me/WOODcraft_Mirror_Zone/80)

## 📝 Notes
- The bot uses in-memory storage (resets on server restart)
- For persistent storage, consider adding a database
- Free tier has limited API calls

Enjoy your image uploading bot! 🎉

## Credit 
- NOOB AND WOODcraft Premium looks Modify..

