// api/cron.js - Daily news delivery cron job
import { fetchNewsFromAllSources } from './news-sources';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const SUBSCRIBED_CHATS = process.env.SUBSCRIBED_CHATS?.split(',') || [];

    if (SUBSCRIBED_CHATS.length === 0) {
      return res.status(200).json({ message: 'No subscribed chats found' });
    }

    const topStories = await fetchNewsFromAllSources();
    
    for (const chatId of SUBSCRIBED_CHATS) {
      const message = formatDailyDigest(topStories);
      await sendMessage(chatId, message, BOT_TOKEN, null, 'Markdown');
    }

    return res.status(200).json({ message: 'Daily news digest sent successfully' });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: 'Error sending daily digest' });
  }
}

function formatDailyDigest(stories) {
  let message = '📰 **Your Daily Tech News Digest**\n\n';
  
  stories.forEach((story, index) => {
    message += `**${index + 1}. ${story.title}**\n`;
    message += `📝 ${story.description}\n`;
    message += `🔗 [Read More](${story.url})\n`;
    message += `📅 ${story.publishedAt}\n`;
    message += `📌 Source: ${story.source}\n\n`;
  });

  message += 'Stay informed with the latest in tech! 🚀';
  return message;
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