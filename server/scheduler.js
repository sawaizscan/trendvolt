require('dotenv').config();
const db = require('./database');
const trendEngine = require('./trendEngine');
const contentGen = require('./contentGenerator');

const RUN_INTERVAL = parseInt(process.env.GOOGLE_TRENDS_INTERVAL) || 3600000;
const MAX_ARTICLES = parseInt(process.env.MAX_ARTICLES_PER_RUN) || 5;

async function runAutomationCycle() {
  console.log(`[Scheduler] Starting automation cycle at ${new Date().toISOString()}`);

  try {
    console.log('[Scheduler] Detecting trends...');
    const trends = await trendEngine.detectTrends();
    console.log(`[Scheduler] Found ${trends.length} trends`);

    const unusedTrends = trendEngine.getUnusedTrends(MAX_ARTICLES);
    console.log(`[Scheduler] Generating articles for ${Math.min(unusedTrends.length, MAX_ARTICLES)} top trends`);

    let generated = 0;
    for (const trend of unusedTrends.slice(0, MAX_ARTICLES)) {
      try {
        const duplicateCheck = db.prepare('SELECT id FROM articles WHERE keywords LIKE ? AND status = ? LIMIT 1').get(`%${trend.keyword}%`, 'published');
        if (duplicateCheck) {
          console.log(`[Scheduler] Skipping duplicate trend: ${trend.keyword}`);
          continue;
        }

        const articleId = contentGen.createArticleFromTrend(trend);
        trendEngine.markTrendGenerated(trend.id, articleId);
        console.log(`[Scheduler] Generated article for: ${trend.keyword} (ID: ${articleId})`);
        generated++;

        await sleep(2000);
      } catch (err) {
        console.error(`[Scheduler] Failed to generate article for ${trend.keyword}:`, err.message);
      }
    }

    console.log(`[Scheduler] Cycle complete. Generated ${generated} articles.`);
  } catch (err) {
    console.error('[Scheduler] Cycle failed:', err.message);
  }
}

async function updateOldArticles() {
  const oldArticles = db.prepare(`
    SELECT id, title, keywords FROM articles
    WHERE status = 'published' AND updated_at < datetime('now', '-7 days')
    ORDER BY updated_at ASC LIMIT 5
  `).all();

  for (const article of oldArticles) {
    db.prepare("UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(article.id);
    console.log(`[Scheduler] Refreshed article: ${article.title}`);
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function start() {
  console.log(`[Scheduler] Starting TrendVolt automation (interval: ${RUN_INTERVAL}ms)`);

  contentGen.seedSampleData();
  await runAutomationCycle();

  setInterval(runAutomationCycle, RUN_INTERVAL);
  setInterval(updateOldArticles, RUN_INTERVAL * 6);
}

if (require.main === module) {
  start().catch(err => {
    console.error('[Scheduler] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runAutomationCycle, updateOldArticles, start };
