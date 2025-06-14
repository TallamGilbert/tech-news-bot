// api/news-sources.js - News fetching from multiple sources

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

export async function fetchNewsFromAllSources() {
  const [newsApiStories, hackerNewsStories, redditStories, devToStories, techCrunchStories] = await Promise.all([
    fetchNewsApiStories(),
    fetchHackerNewsStories(),
    fetchRedditStories(),
    fetchDevToStories(),
    fetchTechCrunchStories()
  ]);

  // Combine and sort all stories by date
  const allStories = [
    ...newsApiStories,
    ...hackerNewsStories,
    ...redditStories,
    ...devToStories,
    ...techCrunchStories
  ].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Return top 3 stories
  return allStories.slice(0, 3);
}

async function fetchNewsApiStories() {
  const query = 'technology OR AI OR programming OR software development';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'ok') {
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: 'News API'
      }));
    }
    return [];
  } catch (error) {
    console.error('News API error:', error);
    return [];
  }
}

async function fetchHackerNewsStories() {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    
    const stories = await Promise.all(
      storyIds.slice(0, 5).map(async (id) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.json();
      })
    );

    return stories.map(story => ({
      title: story.title,
      description: `Score: ${story.score} | Comments: ${story.descendants}`,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      publishedAt: new Date(story.time * 1000).toISOString(),
      source: 'Hacker News'
    }));
  } catch (error) {
    console.error('Hacker News API error:', error);
    return [];
  }
}

async function fetchRedditStories() {
  try {
    const auth = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
    const response = await fetch('https://www.reddit.com/r/programming+technology+artificial+ai/hot.json', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'De_v_aI Bot/1.0'
      }
    });
    
    const data = await response.json();
    return data.data.children.slice(0, 5).map(post => ({
      title: post.data.title,
      description: `Score: ${post.data.score} | Comments: ${post.data.num_comments}`,
      url: `https://reddit.com${post.data.permalink}`,
      publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
      source: 'Reddit'
    }));
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
}

async function fetchDevToStories() {
  try {
    const response = await fetch('https://dev.to/api/articles?top=1&per_page=5');
    const articles = await response.json();
    
    return articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.published_at,
      source: 'Dev.to'
    }));
  } catch (error) {
    console.error('Dev.to API error:', error);
    return [];
  }
}

async function fetchTechCrunchStories() {
  try {
    const response = await fetch('https://techcrunch.com/wp-json/wp/v2/posts?per_page=5');
    const articles = await response.json();
    
    return articles.map(article => ({
      title: article.title.rendered,
      description: article.excerpt.rendered.replace(/<[^>]*>/g, ''),
      url: article.link,
      publishedAt: article.date,
      source: 'TechCrunch'
    }));
  } catch (error) {
    console.error('TechCrunch API error:', error);
    return [];
  }
} 