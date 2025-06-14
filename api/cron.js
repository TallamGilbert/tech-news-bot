// api/cron.js - Daily news delivery cron job
import { fetchNewsFromAllSources } from './news-sources';

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
  schedule: '0 8 * * *' // Run at 8 AM UTC every day
};

export default async function handler(req) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const SUBSCRIBED_CHATS = process.env.SUBSCRIBED_CHATS?.split(',') || [];

    if (SUBSCRIBED_CHATS.length === 0) {
      return new Response('No subscribed chats found', { status: 200 });
    }

    const topStories = await fetchNewsFromAllSources();
    
    for (const chatId of SUBSCRIBED_CHATS) {
      const message = formatDailyDigest(topStories);
      await sendMessage(chatId, message, BOT_TOKEN, null, 'Markdown');
    }

    return new Response('Daily news digest sent successfully', { status: 200 });
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response('Error sending daily digest', { status: 500 });
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