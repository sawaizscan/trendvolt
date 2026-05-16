const db = require('./database');
const mockApis = require('./mockApis');
const rssParser = require('./rssParser');

class TrendEngine {
  constructor() {
    this.sources = [
      'google_trends', 'reddit', 'hacker_news', 'techcrunch',
      'twitter', 'youtube', 'crypto'
    ];
  }

  scoreTrend(keyword, sourceScore, volume, region) {
    const volumeMultiplier = this._parseVolume(volume);
    const recencyBonus = 1.2;
    const sourceWeight = this._getSourceWeight(sourceScore);
    const baseScore = (sourceScore * 0.4 + volumeMultiplier * 0.3 + sourceWeight * 0.3);
    const finalScore = Math.min(100, Math.round(baseScore * recencyBonus * 10) / 10);
    return finalScore;
  }

  _parseVolume(volume) {
    if (!volume) return 50;
    const num = parseFloat(volume.replace(/[K,M,B,+,]/g, ''));
    if (volume.includes('B')) return Math.min(100, num * 10);
    if (volume.includes('M')) return Math.min(100, num);
    if (volume.includes('K')) return Math.min(100, num / 10);
    return Math.min(100, num);
  }

  _getSourceWeight(score) {
    return Math.min(100, (score || 50) * 1.2);
  }

  async detectTrends() {
    const allTrends = [];

    const sources = [
      mockApis.fetchGoogleTrends(),
      mockApis.fetchRedditTrends(),
      mockApis.fetchHackerNewsTrends(),
      mockApis.fetchTechCrunchTrends(),
      mockApis.fetchTwitterTrends(),
      mockApis.fetchYouTubeTrends(),
      mockApis.fetchCryptoTrends(),
    ];

    const results = await Promise.allSettled(sources);
    const allSources = await mockApis.fetchMockTrends();

    allSources.forEach(sourceGroup => {
      (sourceGroup.trends || []).forEach(trend => {
        const score = this.scoreTrend(
          trend.keyword,
          trend.score || 50,
          trend.volume || 'N/A',
          trend.region || 'Global'
        );

        allTrends.push({
          keyword: trend.keyword.toLowerCase().trim(),
          source: sourceGroup.source,
          score: Math.round(score * 10) / 10,
          volume_trend: trend.volume || 'N/A',
          region: trend.region || 'Global',
          status: 'detected'
        });
      });
    });

    const rssItems = await rssParser.parseAllFeeds().catch(() => []);
    const keywords = rssParser.extractKeywords(rssItems);
    keywords.slice(0, 20).forEach(kw => {
      const existing = allTrends.find(t => t.keyword === kw.keyword);
      if (!existing) {
        allTrends.push({
          keyword: kw.keyword,
          source: 'rss',
          score: Math.round(Math.min(100, kw.frequency * 5) * 10) / 10,
          volume_trend: `${kw.frequency} mentions`,
          region: 'Global',
          status: 'detected'
        });
      }
    });

    this._deduplicateAndStore(allTrends);
    return allTrends;
  }

  _deduplicateAndStore(trends) {
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO trends (keyword, source, score, volume_trend, region, status)
      VALUES (?, ?, ?, ?, ?, 'detected')
    `);

    const updateStmt = db.prepare(`
      UPDATE trends SET score = ?, volume_trend = ?, status = 'detected', detected_at = CURRENT_TIMESTAMP
      WHERE keyword = ? AND source = ?
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        const existing = db.prepare('SELECT id FROM trends WHERE keyword = ? AND source = ?').get(item.keyword, item.source);
        if (existing) {
          updateStmt.run(item.score, item.volume_trend, item.keyword, item.source);
        } else {
          insertStmt.run(item.keyword, item.source, item.score, item.volume_trend, item.region);
        }
      }
    });

    transaction(trends);
  }

  getTopTrends(limit = 20) {
    return db.prepare(`
      SELECT DISTINCT t.keyword, t.score, t.source, t.volume_trend, t.region,
        (SELECT COUNT(*) FROM articles WHERE keywords LIKE '%' || t.keyword || '%') as article_count
      FROM trends t
      WHERE t.status = 'detected'
      ORDER BY t.score DESC
      LIMIT ?
    `).all(limit);
  }

  getTrendsBySource(source, limit = 10) {
    return db.prepare(`
      SELECT * FROM trends
      WHERE source = ? AND status = 'detected'
      ORDER BY score DESC
      LIMIT ?
    `).all(source, limit);
  }

  getTrendById(id) {
    return db.prepare('SELECT * FROM trends WHERE id = ?').get(id);
  }

  markTrendGenerated(trendId, articleId) {
    db.prepare('UPDATE trends SET status = ?, article_id = ? WHERE id = ?').run('generated', articleId, trendId);
  }

  getUnusedTrends(limit = 10) {
    return db.prepare(`
      SELECT * FROM trends
      WHERE status = 'detected' AND article_id IS NULL
      ORDER BY score DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = new TrendEngine();
