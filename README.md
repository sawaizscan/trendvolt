# TrendVolt

An AI-powered trending content publishing platform that automatically discovers trending topics from across the internet, generates SEO-optimized articles, and publishes them on a premium modern website.

## Features

### Content Engine
- Automatic trend detection from Google Trends, Reddit, Hacker News, TechCrunch, Twitter/X, YouTube, and Crypto news
- AI article generation with multiple templates (explainers, listicles, comparisons, tutorials, news, predictions)
- SEO-optimized metadata, titles, and descriptions
- FAQ schema, article schema, and table of contents generation
- Automatic internal linking and related articles

### Website
- Modern minimalist dark/light mode design
- Mobile-first responsive layout
- Sticky navbar with category dropdown
- Hero section with trending carousel
- Infinite scroll homepage
- Search functionality with live results
- Category pages
- Related articles section
- Newsletter signup
- Adsense-ready ad placements (`ads.txt`)
- Lighthouse 95+ score optimization

### SEO
- Semantic HTML5
- JSON-LD structured data (Article + FAQ schemas)
- OpenGraph and Twitter Card metadata
- Dynamic sitemap.xml generation
- robots.txt
- Breadcrumb navigation
- Canonical URLs
- Auto-generated slugs and meta descriptions
- Programmatic SEO structure

### Admin Dashboard
- Analytics dashboard with stats and charts
- Trend scanner with source filtering
- Article management
- Content generation queue
- Manual override system
- Pending article moderation

### Automation
- Hourly trend detection cycle
- Automatic article generation from top trends
- Duplicate content prevention
- Old article refresh system
- Configurable cron scheduling

## Tech Stack

| Component     | Technology                        |
|---------------|-----------------------------------|
| Frontend      | HTML5, TailwindCSS, Vanilla JS    |
| Backend       | Node.js, Express                  |
| Database      | SQLite (better-sqlite3)           |
| Automation    | Native scheduler + Cron           |
| SEO           | JSON-LD, OpenGraph, Sitemap       |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Seed database with sample data
npm run seed

# 3. Start the server
npm start

# 4. Open in browser
open http://localhost:3000
```

## Directory Structure

```
trendvolt/
├── server/
│   ├── index.js           # Express server with all API routes
│   ├── database.js        # SQLite database setup and models
│   ├── trendEngine.js     # Trend detection and scoring
│   ├── contentGenerator.js # AI article generation and SEO
│   ├── scheduler.js       # Automated cron jobs
│   ├── rssParser.js       # RSS feed parsing
│   ├── mockApis.js        # Mock trend API data
│   └── seed.js            # Database seeding
├── public/
│   ├── index.html         # Homepage with trend carousel
│   ├── article.html       # Article detail page
│   ├── category.html      # Category listing page
│   ├── search.html        # Search page with live results
│   ├── admin.html         # Admin dashboard
│   ├── css/style.css      # Custom styles
│   └── js/
│       ├── app.js         # Main application logic
│       └── theme.js       # Dark/light theme toggle
├── data/                  # SQLite database directory
├── .env                   # Environment configuration
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | /api/trends                | List detected trends           |
| GET    | /api/trends/sources        | Trends grouped by source       |
| POST   | /api/trends/scan           | Trigger trend scan             |
| POST   | /api/trends/generate       | Generate article from keyword  |
| GET    | /api/articles              | List published articles        |
| GET    | /api/articles/:slug        | Get single article             |
| GET    | /api/search?q=             | Search articles                |
| GET    | /api/categories            | List categories                |
| GET    | /api/categories/:slug      | Category with articles         |
| POST   | /api/subscribe             | Newsletter signup              |
| GET    | /api/analytics/summary     | Analytics dashboard data       |
| GET    | /api/admin/queue           | Content generation queue       |
| POST   | /api/admin/queue/add       | Add keyword to queue           |
| POST   | /api/admin/queue/process   | Process next queue item        |
| POST   | /api/admin/articles/:id/update | Update article             |

## Configuration

Edit `.env` to configure:

- `PORT` - Server port (default: 3000)
- `SITE_URL` - Your production URL
- `CRON_SCHEDULE` - Automation interval (default: every hour)
- `MAX_ARTICLES_PER_RUN` - Max articles per automation cycle
- `NEWS_API_KEY` - Optional: real news API key
- `OPENAI_API_KEY` - Optional: for AI-generated content

## Automation

The scheduler runs automatically:

1. **Every hour**: Scans for new trends and generates articles
2. **Every 6 hours**: Updates old articles with refreshed dates
3. **On demand**: Via admin dashboard "Scan Now" button

To run the scheduler as a standalone process:
```bash
npm run cron
```

## Production Deployment

```bash
# Set production environment
export NODE_ENV=production
export SITE_URL=https://yourdomain.com
export JWT_SECRET=your-secure-secret

# Start with process manager (pm2 recommended)
npm install -g pm2
pm2 start server/index.js --name trendvolt
pm2 save
```

### Nginx Reverse Proxy (recommended)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monetization

The platform is pre-configured for:

1. **Google AdSense**: Edit `ads.txt` with your publisher ID
2. **Affiliate Links**: Add affiliate IDs to article content
3. **Sponsored Placements**: Category and article sponsorship slots
4. **Newsletter**: Built-in subscriber collection with export

## License

MIT
