# DevAI Bot 🤖

A Telegram bot that provides the latest news and updates about AI and development.

## Features

- 🤖 AI News: Latest updates in artificial intelligence and machine learning
- 💻 Development News: Software development, programming, and tech stack updates
- 🔥 Trending: Viral tech stories and breaking news
- 🏢 Startups: AI startup news and funding updates
- 💰 Crypto: AI and cryptocurrency news

## Setup

1. Create a new Telegram bot:
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use the `/newbot` command
   - Set the bot name to "devai"
   - Set the username to "De_v_aI_Bot"
   - Save the bot token provided by BotFather

2. Get a News API key:
   - Sign up at [News API](https://newsapi.org)
   - Get your API key from the dashboard

3. Deploy to Vercel:
   - Fork this repository
   - Create a new project on Vercel
   - Add the following environment variables:
     - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
     - `NEWS_API_KEY`: Your News API key

4. Set up the webhook:
   - Replace `YOUR_BOT_TOKEN` with your actual bot token
   - Replace `YOUR_VERCEL_URL` with your Vercel deployment URL
   - Visit this URL in your browser:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_VERCEL_URL/api/webhook
   ```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

## Commands

- `/start` - Start the bot and see available commands
- `/ai` - Get latest AI news
- `/dev` - Get development news
- `/trending` - Get trending tech stories
- `/startups` - Get AI startup news
- `/crypto` - Get AI & crypto news
- `/help` - Show help message

## License

MIT