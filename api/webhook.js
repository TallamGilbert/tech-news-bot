// api/webhook.js - Main webhook handler for devai bot
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { message, callback_query } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
    try {
      if (message) {
        await handleMessage(message, BOT_TOKEN);
      } else if (callback_query) {
        await handleCallbackQuery(callback_query, BOT_TOKEN);
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async function handleMessage(message, botToken) {
    const chatId = message.chat.id;
    const text = message.text;
  
    if (text === '/start') {
      const welcomeMessage = `🤖 Welcome to DevAI Bot!
  
  I'm your AI and development news companion. Here's what I can do:
  
  🤖 /ai - Latest AI news and updates
  💻 /dev - Development news and tools
  🔥 /trending - Trending tech stories
  🏢 /startups - AI startup news
  💰 /crypto - AI & crypto news
  ℹ️ /help - Show this help message
  
  Choose a category or type a command to get started!`;
  
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🤖 AI News', callback_data: 'ai' },
            { text: '💻 Dev News', callback_data: 'dev' }
          ],
          [
            { text: '🔥 Trending', callback_data: 'trending' },
            { text: '🏢 Startups', callback_data: 'startups' }
          ],
          [
            { text: '💰 Crypto', callback_data: 'crypto' }
          ]
        ]
      };
  
      await sendMessage(chatId, welcomeMessage, botToken, keyboard);
    } else if (text === '/help') {
      await sendHelpMessage(chatId, botToken);
    } else if (text === '/ai') {
      await sendNews(chatId, 'ai', botToken);
    } else if (text === '/dev') {
      await sendNews(chatId, 'dev', botToken);
    } else if (text === '/trending') {
      await sendNews(chatId, 'trending', botToken);
    } else if (text === '/startups') {
      await sendNews(chatId, 'startups', botToken);
    } else if (text === '/crypto') {
      await sendNews(chatId, 'crypto', botToken);
    } else {
      await sendMessage(chatId, "Sorry, I didn't understand that command. Type /help to see available commands.", botToken);
    }
  }
  
  async function handleCallbackQuery(callbackQuery, botToken) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
  
    // Answer the callback query to remove loading state
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id })
    });
  
    if (data === 'menu') {
      await handleMessage({ chat: { id: chatId }, text: '/start' }, botToken);
    } else {
      await sendNews(chatId, data, botToken);
    }
  }
  
  async function sendNews(chatId, category, botToken) {
    try {
      await sendMessage(chatId, '🔄 Fetching latest news...', botToken);
      
      const articles = await fetchNews(category);
      
      if (articles.length === 0) {
        await sendMessage(chatId, 'Sorry, no news found at the moment. Please try again later.', botToken);
        return;
      }
  
      const categoryEmoji = {
        ai: '🤖',
        dev: '💻',
        trending: '🔥',
        startups: '🏢',
        crypto: '💰'
      };
  
      let newsMessage = `${categoryEmoji[category]} **${category.toUpperCase()} NEWS**\n\n`;
      
      articles.slice(0, 5).forEach((article, index) => {
        newsMessage += `**${index + 1}. ${article.title}**\n`;
        if (article.description) {
          newsMessage += `${article.description.substring(0, 100)}...\n`;
        }
        newsMessage += `🔗 [Read More](${article.url})\n`;
        newsMessage += `📅 ${formatDate(article.publishedAt)}\n\n`;
      });
  
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Refresh', callback_data: category },
            { text: '🏠 Main Menu', callback_data: 'menu' }
          ]
        ]
      };
  
      await sendMessage(chatId, newsMessage, botToken, keyboard, 'Markdown');
    } catch (error) {
      console.error('Error sending news:', error);
      await sendMessage(chatId, 'Sorry, there was an error fetching the news. Please try again later.', botToken);
    }
  }
  
  async function fetchNews(category) {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    const queries = {
      ai: 'artificial intelligence OR machine learning OR deep learning OR AI OR neural networks',
      dev: 'software development OR programming OR coding OR developer tools OR tech stack',
      trending: 'trending technology OR viral tech OR breaking tech news',
      startups: 'AI startup OR tech startup OR venture capital OR funding',
      crypto: 'AI cryptocurrency OR blockchain OR bitcoin OR ethereum OR crypto'
    };
  
    const query = queries[category] || queries.ai;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok') {
        return data.articles.filter(article => 
          article.title && 
          article.url && 
          !article.title.includes('[Removed]')
        );
      }
      return [];
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }
  
  async function sendMessage(chatId, text, botToken, replyMarkup = null, parseMode = null) {
    const payload = {
      chat_id: chatId,
      text: text
    };
  
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
  
    if (parseMode) {
      payload.parse_mode = parseMode;
    }
  
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    return response.json();
  }
  
  async function sendHelpMessage(chatId, botToken) {
    const helpText = `🤖 **DevAI Bot Help**
  
  **Available Commands:**
  🤖 /ai - Latest AI news and updates
  💻 /dev - Development news and tools
  🔥 /trending - Trending tech stories
  🏢 /startups - AI startup news
  💰 /crypto - AI & crypto news
  ℹ️ /help - Show this help message
  
  **How to use:**
  • Click the buttons below messages for quick access
  • Use commands directly by typing them
  • Get fresh news updates anytime
  
  Stay updated with the latest in AI and development! 🚀`;
  
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🤖 AI News', callback_data: 'ai' },
          { text: '💻 Dev News', callback_data: 'dev' }
        ]
      ]
    };
  
    await sendMessage(chatId, helpText, botToken, keyboard, 'Markdown');
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }