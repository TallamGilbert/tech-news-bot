const NEWS_API_KEY = process.env.NEWS_API_KEY;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

export async function fetchNewsFromAllSources() {
  const [
    newsApiStories,
    hackerNewsStories,
    redditStories,
    devToStories,
    techCrunchStories
  ] = await Promise.all([
    fetchNewsApiStories(),
    fetchHackerNewsStories(),
    fetchRedditStories(),
    fetchDevToStories(),
    fetchTechCrunchStories()
  ]);

  console.log('NewsAPI:', newsApiStories.length);
  console.log('Hacker News:', hackerNewsStories.length);
  console.log('Reddit:', redditStories.length);
  console.log('Dev.to:', devToStories.length);
  console.log('TechCrunch:', techCrunchStories.length);

  const allStories = [
    ...newsApiStories,
    ...hackerNewsStories,
    ...redditStories,
    ...devToStories,
    ...techCrunchStories
  ].filter(story => story.title && story.url)
   .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return allStories.slice(0, 3); // Or increase this if needed
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
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const response = await fetch('https://oauth.reddit.com/r/programming+technology+ai/hot.json?limit=5', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'De_v_aI Bot/1.0'
      }
    });

    const data = await response.json();
    return data.data.children.map(post => ({
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
