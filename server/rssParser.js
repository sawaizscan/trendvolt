const RssParser = require('rss-parser');
const parser = new RssParser();

const RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/TechCrunch/', source: 'techcrunch' },
  { url: 'https://news.ycombinator.com/rss', source: 'hacker_news' },
  { url: 'https://www.reddit.com/r/technology/.rss', source: 'reddit' },
  { url: 'https://www.reddit.com/r/Futurology/.rss', source: 'reddit' },
  { url: 'https://www.reddit.com/r/science/.rss', source: 'reddit' },
];

const CACHE = { data: null, timestamp: 0 };
const CACHE_TTL = 30 * 60 * 1000;

async function parseAllFeeds() {
  if (Date.now() - CACHE.timestamp < CACHE_TTL && CACHE.data) {
    return CACHE.data;
  }

  const results = [];
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, 10).map(item => ({
        title: item.title || '',
        link: item.link || '',
        content: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.source,
        categories: item.categories || [],
        creator: item.creator || 'TrendVolt'
      }));
      results.push(...items);
    } catch (err) {
      console.warn(`RSS parse failed for ${feed.url}:`, err.message);
    }
  }

  CACHE.data = results;
  CACHE.timestamp = Date.now();
  return results;
}

function extractKeywords(articles) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);

  const wordFreq = {};
  articles.forEach(article => {
    const words = (article.title + ' ' + (article.content || ''))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, freq]) => ({ keyword: word, frequency: freq }));
}

module.exports = { parseAllFeeds, extractKeywords };
