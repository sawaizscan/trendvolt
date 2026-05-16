const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_PATH || './data/trendvolt.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initialize() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      article_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      meta_title TEXT,
      meta_description TEXT,
      content TEXT NOT NULL,
      excerpt TEXT,
      category_id INTEGER,
      tags TEXT,
      status TEXT DEFAULT 'draft',
      trend_score REAL DEFAULT 0,
      source TEXT,
      source_url TEXT,
      keywords TEXT,
      reading_time INTEGER,
      featured_image TEXT,
      image_alt TEXT,
      canonical_url TEXT,
      is_trending INTEGER DEFAULT 0,
      allows_comments INTEGER DEFAULT 1,
      view_count INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      source TEXT NOT NULL,
      score REAL DEFAULT 0,
      volume_trend TEXT,
      region TEXT,
      article_id INTEGER,
      status TEXT DEFAULT 'detected',
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      confirmed INTEGER DEFAULT 0,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      article_id INTEGER,
      page_url TEXT,
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      country TEXT,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trend_keyword TEXT NOT NULL,
      title TEXT,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 0,
      schedule_for DATETIME,
      generated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(is_trending);
    CREATE INDEX IF NOT EXISTS idx_trends_keyword ON trends(keyword);
    CREATE INDEX IF NOT EXISTS idx_trends_score ON trends(score DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_type, created_at);
  `);
}

initialize();

module.exports = db;
