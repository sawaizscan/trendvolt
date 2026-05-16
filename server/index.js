require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const trendEngine = require('./trendEngine');
const contentGen = require('./contentGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1d', etag: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

app.use((req, res, next) => {
  res.locals.siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  res.locals.siteName = process.env.SITE_NAME || 'TrendVolt';
  next();
});

contentGen.seedSampleData();

app.get('/api/trends', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const trends = trendEngine.getTopTrends(limit);
  res.json({ trends, total: trends.length });
});

app.get('/api/trends/sources', (req, res) => {
  const sources = {};
  for (const source of trendEngine.sources) {
    sources[source] = trendEngine.getTrendsBySource(source, 5);
  }
  res.json({ sources });
});

app.post('/api/trends/scan', async (req, res) => {
  try {
    const trends = await trendEngine.detectTrends();
    res.json({ trends: trends.slice(0, 20), total: trends.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trends/generate', (req, res) => {
  const { keyword, template } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword required' });

  const trend = db.prepare('SELECT * FROM trends WHERE keyword = ? ORDER BY score DESC LIMIT 1').get(keyword.toLowerCase().trim())
    || { keyword, score: 70, source: 'manual' };

  try {
    const articleId = contentGen.createArticleFromTrend(trend);
    const article = contentGen.getArticleBySlug(db.prepare('SELECT slug FROM articles WHERE id = ?').get(articleId).slug);
    res.json({ article, id: articleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const category = req.query.category || null;
  const articles = contentGen.getAllArticles(limit, offset, category);
  const total = db.prepare('SELECT COUNT(*) as count FROM articles WHERE status = ?' + (category ? ' AND category_id IN (SELECT id FROM categories WHERE slug = ?)' : '')).all('published');
  res.json({ articles, total: total.length > 0 ? total[0].count : 0, offset, limit });
});

app.get('/api/articles/:slug', (req, res) => {
  const article = contentGen.getArticleBySlug(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const related = contentGen.getRelatedArticles(article.id, article.category_id);
  const articleSchema = contentGen.generateArticleSchema(article);

  res.json({ article, related, schemas: { article: articleSchema, faq: article.faqs ? contentGen.generateFAQSchema(article.faqs) : null } });
});

app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) return res.json({ articles: [], total: 0 });
  const articles = contentGen.searchArticles(query);
  res.json({ articles, total: articles.length, query });
});

app.get('/api/categories', (req, res) => {
  const categories = contentGen.getCategories();
  res.json({ categories });
});

app.get('/api/categories/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  const articles = contentGen.getAllArticles(50, 0, req.params.slug);
  res.json({ category: cat, articles });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  try {
    db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/summary', (req, res) => {
  const totalArticles = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'published'").get().count;
  const totalViews = db.prepare('SELECT COALESCE(SUM(view_count), 0) as total FROM articles').get().total;
  const totalTrends = db.prepare("SELECT COUNT(*) as count FROM trends WHERE status = 'detected'").get().count;
  const totalSubs = db.prepare('SELECT COUNT(*) as count FROM subscribers').get().count;
  const recentViews = db.prepare("SELECT DATE(created_at) as date, COUNT(*) as views FROM analytics_events WHERE event_type = 'page_view' AND created_at > datetime('now', '-7 days') GROUP BY DATE(created_at)").all();
  const topArticles = db.prepare('SELECT title, slug, view_count FROM articles WHERE status = ? ORDER BY view_count DESC LIMIT 10').all('published');

  res.json({ totalArticles, totalViews, totalTrends, totalSubs, recentViews, topArticles });
});

app.get('/api/admin/queue', (req, res) => {
  const queue = db.prepare(`
    SELECT cq.*, t.score, t.source
    FROM content_queue cq
    LEFT JOIN trends t ON cq.trend_keyword = t.keyword
    ORDER BY cq.priority DESC, cq.created_at DESC
    LIMIT 50
  `).all();
  res.json({ queue });
});

app.post('/api/admin/queue/add', (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword required' });
  db.prepare('INSERT OR IGNORE INTO content_queue (trend_keyword, priority) VALUES (?, ?)').run(keyword.toLowerCase().trim(), 10);
  res.json({ success: true });
});

app.post('/api/admin/queue/process', (req, res) => {
  const item = db.prepare("SELECT * FROM content_queue WHERE status = 'pending' ORDER BY priority DESC LIMIT 1").get();
  if (!item) return res.json({ message: 'No items in queue' });

  const trend = { keyword: item.trend_keyword, score: 80, source: 'admin' };
  const articleId = contentGen.createArticleFromTrend(trend);
  db.prepare("UPDATE content_queue SET status = 'completed', generated_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.id);
  res.json({ success: true, articleId });
});

app.post('/api/admin/articles/:id/update', (req, res) => {
  const { title, content, meta_title, meta_description, status } = req.body;
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  db.prepare(`
    UPDATE articles SET title = COALESCE(?, title), content = COALESCE(?, content),
      meta_title = COALESCE(?, meta_title), meta_description = COALESCE(?, meta_description),
      status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title || null, content || null, meta_title || null, meta_description || null, status || null, req.params.id);

  if (status === 'published') {
    db.prepare('UPDATE articles SET published_at = COALESCE(published_at, CURRENT_TIMESTAMP) WHERE id = ?').run(req.params.id);
  }

  res.json({ success: true });
});

app.get('/api/admin/articles/pending', (req, res) => {
  const articles = db.prepare("SELECT id, title, slug, trend_score, source, created_at FROM articles WHERE status = 'draft' ORDER BY created_at DESC LIMIT 20").all();
  res.json({ articles });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.SITE_URL || 'http://localhost:3000'}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const articles = db.prepare("SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC").all();
  const categories = db.prepare('SELECT slug FROM categories').all();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><priority>1.0</priority><changefreq>hourly</changefreq></url>
  <url><loc>${siteUrl}/search</loc><priority>0.5</priority><changefreq>daily</changefreq></url>\n`;

  categories.forEach(cat => {
    xml += `  <url><loc>${siteUrl}/category/${cat.slug}</loc><priority>0.8</priority><changefreq>daily</changefreq></url>\n`;
  });

  articles.forEach(article => {
    xml += `  <url><loc>${siteUrl}/article/${article.slug}</loc><priority>0.9</priority><lastmod>${article.updated_at || new Date().toISOString()}</lastmod><changefreq>weekly</changefreq></url>\n`;
  });

  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'TrendVolt',
    short_name: 'TrendVolt',
    description: 'Your pulse on what\'s trending across the internet',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    icons: [{ src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' }]
  });
});

app.get('/ads.txt', (req, res) => {
  res.type('text/plain');
  res.send('# Google AdSense\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n');
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  const filePath = path.join(__dirname, '..', 'public', 'index.html');
  if (req.path.startsWith('/article/')) return res.sendFile(path.join(__dirname, '..', 'public', 'article.html'));
  if (req.path.startsWith('/category/')) return res.sendFile(path.join(__dirname, '..', 'public', 'category.html'));
  if (req.path.startsWith('/search')) return res.sendFile(path.join(__dirname, '..', 'public', 'search.html'));
  if (req.path.startsWith('/admin')) return res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`\n  TrendVolt running at http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}/admin`);
  console.log(`  API: http://localhost:${PORT}/api/articles\n`);
});
