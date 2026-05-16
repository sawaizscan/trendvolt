(function() {
  'use strict';

  const API_BASE = '/api';
  const STATE = {
    articles: { page: 0, loading: false, hasMore: true },
    trends: { all: [], filtered: [] },
    standalone: false,
  };

  const MOCK = {
    categories: [
      { id: 1, name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'AI news, trends, and analysis', article_count: 3 },
      { id: 2, name: 'Technology', slug: 'technology', description: 'General technology', article_count: 2 },
      { id: 3, name: 'Science', slug: 'science', description: 'Scientific breakthroughs', article_count: 1 },
      { id: 4, name: 'Business', slug: 'business', description: 'Business and startups', article_count: 1 },
      { id: 5, name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', article_count: 1 },
    ],
    trends: [
      { keyword: 'AI agents explained', score: 95, source: 'google_trends', volume_trend: '1M+', region: 'Global', article_count: 1 },
      { keyword: 'Quantum computing breakthrough 2024', score: 88, source: 'google_trends', volume_trend: '500K+', region: 'US', article_count: 1 },
      { keyword: 'Best AI coding tools', score: 92, source: 'google_trends', volume_trend: '750K+', region: 'Global', article_count: 1 },
      { keyword: 'Neuralink update', score: 85, source: 'reddit', volume_trend: '600K+', region: 'US', article_count: 0 },
      { keyword: 'OpenAI GPT-5 rumors', score: 91, source: 'reddit', volume_trend: '2K+ discussions', region: 'Global', article_count: 0 },
      { keyword: 'AI video generation', score: 94, source: 'twitter', volume_trend: '100K+ posts', region: 'Global', article_count: 0 },
      { keyword: 'Bitcoin price prediction', score: 88, source: 'crypto', volume_trend: '1M+ searches', region: 'Global', article_count: 0 },
      { keyword: 'Apple Vision Pro apps', score: 80, source: 'techcrunch', volume_trend: '400K+', region: 'Global', article_count: 0 },
      { keyword: 'AI startup funding 2024', score: 93, source: 'techcrunch', volume_trend: 'Featured', region: 'Global', article_count: 0 },
      { keyword: 'SpaceX Stars launch', score: 84, source: 'techcrunch', volume_trend: 'Featured', region: 'Global', article_count: 0 },
      { keyword: 'Rust vs Go 2024', score: 86, source: 'hacker_news', volume_trend: '500+ points', region: 'Global', article_count: 0 },
      { keyword: 'Tech layoffs 2024', score: 90, source: 'reddit', volume_trend: '10K+ discussions', region: 'US', article_count: 0 },
    ],
    articles: [
      { id: 1, title: 'AI Agents Explained: How Autonomous AI Systems Are Transforming Technology in 2024', slug: 'ai-agents-explained', category_name: 'Artificial Intelligence', category_slug: 'artificial-intelligence', excerpt: 'AI agents represent a revolutionary leap forward in artificial intelligence technology.', reading_time: 8, view_count: 1247, published_at: new Date(Date.now() - 3600000).toISOString(), trend_score: 95, featured_image: null },
      { id: 2, title: 'Quantum Computing Breakthrough 2024: The Race to Quantum Supremacy Heats Up', slug: 'quantum-computing-breakthrough-2024', category_name: 'Science', category_slug: 'science', excerpt: 'Quantum computing has reached a pivotal moment in 2024 with multiple breakthroughs.', reading_time: 6, view_count: 892, published_at: new Date(Date.now() - 7200000).toISOString(), trend_score: 88, featured_image: null },
      { id: 3, title: 'Best AI Coding Tools in 2024: The Ultimate Guide to AI-Powered Development', slug: 'best-ai-coding-tools-2024', category_name: 'Artificial Intelligence', category_slug: 'artificial-intelligence', excerpt: 'AI-powered coding tools have transformed software development in 2024.', reading_time: 10, view_count: 2156, published_at: new Date(Date.now() - 10800000).toISOString(), trend_score: 92, featured_image: null },
      { id: 4, title: 'Why Is AI Video Generation Trending? Everything You Need to Know', slug: 'ai-video-generation-trending', category_name: 'Technology', category_slug: 'technology', excerpt: 'AI video generation has exploded across social media and tech news.', reading_time: 5, view_count: 3451, published_at: new Date(Date.now() - 14400000).toISOString(), trend_score: 94, featured_image: null },
      { id: 5, title: 'AI Startup Funding 2024: Record Investments Reshaping the Industry', slug: 'ai-startup-funding-2024', category_name: 'Business', category_slug: 'business', excerpt: 'AI startups are seeing unprecedented funding rounds in 2024.', reading_time: 7, view_count: 678, published_at: new Date(Date.now() - 18000000).toISOString(), trend_score: 93, featured_image: null },
      { id: 6, title: 'Bitcoin Price Prediction 2024: What Experts Are Saying', slug: 'bitcoin-price-prediction-2024', category_name: 'Crypto', category_slug: 'crypto', excerpt: 'Cryptocurrency markets are showing renewed momentum.', reading_time: 6, view_count: 4567, published_at: new Date(Date.now() - 21600000).toISOString(), trend_score: 88, featured_image: null },
      { id: 7, title: 'OpenAI GPT-5 Rumors: What We Know So Far', slug: 'openai-gpt-5-rumors', category_name: 'Technology', category_slug: 'technology', excerpt: 'Rumors about OpenAI GPT-5 are circulating across social media.', reading_time: 4, view_count: 7234, published_at: new Date(Date.now() - 25200000).toISOString(), trend_score: 91, featured_image: null },
      { id: 8, title: 'Neuralink Update: Latest Brain-Computer Interface Breakthroughs', slug: 'neuralink-update-2024', category_name: 'Artificial Intelligence', category_slug: 'artificial-intelligence', excerpt: 'Neuralink has announced new milestones in brain-computer interface technology.', reading_time: 5, view_count: 1890, published_at: new Date(Date.now() - 28800000).toISOString(), trend_score: 85, featured_image: null },
    ],
    articleDetails: {
      'ai-agents-explained': {
        title: 'AI Agents Explained: How Autonomous AI Systems Are Transforming Technology in 2024',
        slug: 'ai-agents-explained',
        content: '<h2 id="what-are-ai-agents">What Are AI Agents?</h2><p>AI agents represent a revolutionary leap forward in artificial intelligence technology. Unlike traditional AI systems that simply respond to commands, AI agents are autonomous software programs capable of perceiving their environment, making decisions, and taking actions to achieve specific goals without constant human intervention.</p><p>Think of AI agents as your digital workforce — they can plan, execute tasks, learn from outcomes, and adapt their strategies accordingly. From scheduling meetings to writing code, AI agents are being deployed across industries to automate complex workflows.</p><h2 id="why-they-matter">Why AI Agents Are Trending Now</h2><p>The explosion of interest in AI agents can be traced to several key developments in 2024. Major tech companies including OpenAI, Google, Microsoft, and Anthropic have released frameworks that make it easier to build and deploy AI agents. Open-source projects like AutoGPT, BabyAGI, and CrewAI have democratized access.</p><p>YouTube tutorials on building AI agents have accumulated millions of views, indicating a massive wave of interest from developers and businesses alike.</p><h2 id="how-they-work">How AI Agents Work</h2><p>At their core, AI agents operate on a perception-action loop. They <strong>perceive</strong> their environment through APIs and user input, <strong>reason</strong> using large language models, <strong>act</strong> by calling tools and executing code, and <strong>learn</strong> by incorporating feedback.</p><h2 id="key-players">Key Players</h2><p>The AI agent ecosystem includes OpenAI GPT-4 with function calling, Microsoft Copilot, Cognition AI Devin, and open-source alternatives from the community.</p><h2 id="applications">Real-World Applications</h2><p>AI agents are used for software development, customer support, data analysis, content creation, and business automation. They are becoming an essential tool across industries.</p><h2 id="faq">Frequently Asked Questions</h2><div class="faq-item"><h3>What exactly is an AI agent?</h3><p>An AI agent is an autonomous software program that can perceive its environment, make decisions, and take actions to achieve goals without constant human guidance.</p></div><div class="faq-item"><h3>How are AI agents different from chatbots?</h3><p>While chatbots respond to queries, AI agents take independent action. They can plan multi-step tasks, use tools, execute code, and learn from outcomes.</p></div><div class="faq-item"><h3>Are AI agents safe?</h3><p>Safety depends on proper implementation. Leading frameworks include guardrails, human oversight mechanisms, and constraint systems.</p></div><div class="faq-item"><h3>Can I build my own AI agent?</h3><p>Yes! Open-source frameworks like AutoGPT, CrewAI, and LangChain make it accessible to build custom AI agents with basic programming knowledge.</p></div>',
        category_name: 'Artificial Intelligence',
        category_slug: 'artificial-intelligence',
        reading_time: 8,
        view_count: 1247,
        published_at: new Date(Date.now() - 3600000).toISOString(),
        table_of_contents: [
          { text: 'What Are AI Agents?', id: 'what-are-ai-agents' },
          { text: 'Why AI Agents Are Trending Now', id: 'why-they-matter' },
          { text: 'How AI Agents Work', id: 'how-they-work' },
          { text: 'Key Players', id: 'key-players' },
          { text: 'Real-World Applications', id: 'applications' },
          { text: 'Frequently Asked Questions', id: 'faq' },
        ],
        faqs: [
          { question: 'What exactly is an AI agent?', answer: 'An AI agent is an autonomous software program that can perceive its environment, make decisions, and take actions to achieve goals without constant human guidance.' },
          { question: 'How are AI agents different from chatbots?', answer: 'While chatbots respond to queries, AI agents take independent action. They can plan multi-step tasks, use tools, execute code, and learn from outcomes.' },
          { question: 'Are AI agents safe?', answer: 'Safety depends on proper implementation. Leading frameworks include guardrails, human oversight mechanisms, and constraint systems.' },
          { question: 'Can I build my own AI agent?', answer: 'Yes! Open-source frameworks like AutoGPT, CrewAI, and LangChain make it accessible to build custom AI agents with basic programming knowledge.' },
        ],
        tags: 'AI, artificial intelligence, agents, automation, GPT, machine learning',
      },
    },
  };

  function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-300 z-50 text-sm font-medium';
    if (type === 'error') toast.classList.add('bg-red-500', 'text-white');
    else if (type === 'success') toast.classList.add('bg-green-500', 'text-white');
    else toast.classList.add('bg-gray-900', 'dark:bg-white', 'text-white', 'dark:text-gray-900');
    requestAnimationFrame(() => {
      toast.classList.add('show');
      toast.classList.remove('translate-y-20', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      toast.classList.remove('show');
    }, 3000);
  }

  function mockResponse(url, options) {
    if (url.startsWith('/trends?limit=')) {
      const limit = parseInt(url.match(/limit=(\d+)/)?.[1]) || 20;
      return { trends: MOCK.trends.slice(0, limit), total: Math.min(MOCK.trends.length, limit) };
    }
    if (url === '/trends/sources') {
      const groups = {};
      for (const t of MOCK.trends) {
        if (!groups[t.source]) groups[t.source] = [];
        groups[t.source].push(t);
      }
      return { sources: groups };
    }
    if (url.startsWith('/articles?limit=')) {
      const limit = parseInt(url.match(/limit=(\d+)/)?.[1]) || 50;
      const offset = parseInt(url.match(/offset=(\d+)/)?.[1]) || 0;
      return { articles: MOCK.articles.slice(offset, offset + limit), total: MOCK.articles.length, offset, limit };
    }
    if (url.startsWith('/articles/')) {
      const slug = url.replace('/articles/', '');
      const article = MOCK.articleDetails[slug];
      if (article) {
        const related = MOCK.articles.filter(a => a.slug !== slug).slice(0, 4);
        return { article, related, schemas: {} };
      }
    }
    if (url.startsWith('/search?q=')) {
      const query = decodeURIComponent(url.match(/q=([^&]*)/)?.[1] || '').toLowerCase();
      const articles = MOCK.articles.filter(a =>
        a.title.toLowerCase().includes(query) || (a.excerpt || '').toLowerCase().includes(query)
      );
      return { articles, total: articles.length, query };
    }
    if (url === '/categories') return { categories: MOCK.categories };
    if (url.startsWith('/categories/')) {
      const slug = url.replace('/categories/', '');
      const cat = MOCK.categories.find(c => c.slug === slug);
      if (cat) {
        const articles = MOCK.articles.filter(a => a.category_slug === slug);
        return { category: cat, articles };
      }
    }
    if (url === '/analytics/summary') {
      return {
        totalArticles: MOCK.articles.length,
        totalViews: MOCK.articles.reduce((s, a) => s + (a.view_count || 0), 0),
        totalTrends: MOCK.trends.length,
        totalSubs: 142,
        recentViews: Array.from({length: 7}, (_, i) => ({ date: new Date(Date.now() - (6-i)*86400000).toISOString().slice(0,10), views: Math.floor(Math.random() * 200) + 50 })),
        topArticles: MOCK.articles.sort((a, b) => (b.view_count||0) - (a.view_count||0)).slice(0, 5).map(a => ({ title: a.title, slug: a.slug, view_count: a.view_count })),
      };
    }
    if (url === '/admin/queue') return { queue: [] };
    return null;
  }

  async function apiFetch(url, options) {
    try {
      const res = await fetch(API_BASE + url, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        ...options
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      STATE.standalone = false;
      return data;
    } catch (err) {
      const mock = mockResponse(url, options);
      if (mock) {
        STATE.standalone = true;
        return mock;
      }
      console.error('API Error:', err);
      return null;
    }
  }

  function initHomePage() {
    loadTrendingCarousel();
    loadTrends();
    loadArticles();
    initSourceFilters();
    initNewsletterForm();
    loadFooterData();
    loadCategoriesDropdown();
  }

  async function loadTrendingCarousel() {
    const container = document.getElementById('trending-carousel');
    if (!container) return;
    const data = await apiFetch('/trends?limit=4');
    if (!data || !data.trends) return;
    container.innerHTML = data.trends.map(t => `
      <div class="trend-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-trend-400 uppercase tracking-wider">${t.source.replace(/_/g, ' ')}</span>
          <span class="trend-score">${t.score}</span>
        </div>
        <p class="text-sm font-medium text-white leading-snug">${t.keyword}</p>
        <p class="text-xs text-gray-500 mt-2">${t.volume_trend || 'Trending'}</p>
      </div>
    `).join('');
  }

  async function loadTrends(source) {
    const grid = document.getElementById('trends-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Loading trends...</div>';

    let data;
    if (source && source !== 'all') {
      const srcData = await apiFetch('/trends/sources');
      if (!srcData) return;
      STATE.trends.all = Object.values(srcData.sources).flat();
    } else {
      data = await apiFetch('/trends?limit=15');
      if (!data) return;
      STATE.trends.all = data.trends || [];
    }

    STATE.trends.filtered = source && source !== 'all'
      ? STATE.trends.all.filter(t => t.source === source)
      : STATE.trends.all;

    renderTrends(STATE.trends.filtered);
  }

  function renderTrends(trends) {
    const grid = document.getElementById('trends-grid');
    if (!grid) return;

    if (!trends || trends.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No trends detected yet. Click "Scan Now" in the admin panel.</div>';
      return;
    }

    grid.innerHTML = trends.map(t => {
      const scoreColor = t.score >= 85 ? 'from-green-400 to-emerald-500' :
                         t.score >= 70 ? 'from-trend-400 to-purple-500' :
                         'from-yellow-400 to-orange-500';
      return `
      <div class="trend-card cursor-pointer" onclick="window.location.href='/search?q=${encodeURIComponent(t.keyword)}'">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-trend-400 uppercase tracking-wider px-2 py-0.5 bg-trend-500/10 rounded">${t.source.replace(/_/g, ' ')}</span>
          <span class="text-sm font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent">${t.score}</span>
        </div>
        <h3 class="text-base font-semibold text-white mb-2">${t.keyword}</h3>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>${t.volume_trend || 'Trending'}</span>
          <span>${t.region || 'Global'}</span>
        </div>
        ${t.article_count > 0 ? `<div class="mt-2"><span class="text-xs text-trend-400">${t.article_count} article${t.article_count > 1 ? 's' : ''}</span></div>` : ''}
      </div>`;
    }).join('');
  }

  function initSourceFilters() {
    document.querySelectorAll('.source-filter').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.source-filter').forEach(b => {
          b.className = 'source-filter px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-surface-lighter text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors';
        });
        this.className = 'source-filter active px-4 py-1.5 rounded-lg text-sm font-medium bg-trend-500 text-white';
        loadTrends(this.dataset.source);
      });
    });
  }

  async function loadArticles(reset) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    if (reset) {
      STATE.articles.page = 0;
      STATE.articles.hasMore = true;
    }

    if (STATE.articles.loading || !STATE.articles.hasMore) return;
    STATE.articles.loading = true;

    const data = await apiFetch(`/articles?limit=9&offset=${STATE.articles.page * 9}`);
    STATE.articles.loading = false;

    if (!data || !data.articles) return;

    if (reset) grid.innerHTML = '';

    if (data.articles.length < 9) STATE.articles.hasMore = false;

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('hidden', !STATE.articles.hasMore);
    }

    data.articles.forEach(article => {
      const card = document.createElement('a');
      card.href = `/article/${article.slug}`;
      card.className = 'article-card group';
      card.innerHTML = `
        <div class="aspect-[16/9] bg-gradient-to-br from-trend-400/20 to-purple-500/20 overflow-hidden">
          <div class="article-image w-full h-full flex items-center justify-center text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
            <svg class="w-12 h-12 text-trend-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-trend-500 bg-trend-500/10 px-2 py-0.5 rounded">${article.category_name || 'Trending'}</span>
            <span class="text-xs text-gray-400">${article.reading_time || 5} min read</span>
          </div>
          <h3 class="font-semibold text-base leading-snug mb-2 group-hover:text-trend-500 transition-colors line-clamp-2">${article.title}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">${article.excerpt || ''}</p>
          <div class="flex items-center justify-between mt-4 text-xs text-gray-400">
            <span>${formatDate(article.published_at)}</span>
            <span>${article.view_count || 0} views</span>
          </div>
        </div>`;
      grid.appendChild(card);
    });

    STATE.articles.page++;
  }

  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value;
      const msg = document.getElementById('newsletter-message');
      const result = await apiFetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (result && result.success) {
        msg.textContent = 'Thanks for subscribing! Stay tuned for trending updates.';
        msg.className = 'text-green-300 text-sm mt-3';
        this.querySelector('input').value = '';
      } else {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.className = 'text-red-300 text-sm mt-3';
      }
    });
  }

  async function loadFooterData() {
    const trendsEl = document.getElementById('footer-trends');
    const catsEl = document.getElementById('footer-categories');
    if (trendsEl) {
      const data = await apiFetch('/trends?limit=5');
      if (data && data.trends) {
        trendsEl.innerHTML = data.trends.map(t => `<li><a href="/search?q=${encodeURIComponent(t.keyword)}" class="hover:text-white transition-colors">${t.keyword}</a></li>`).join('');
      }
    }
    if (catsEl) {
      const data = await apiFetch('/categories');
      if (data && data.categories) {
        catsEl.innerHTML = data.categories.map(c => `<li><a href="/category/${c.slug}" class="hover:text-white transition-colors capitalize">${c.name}</a></li>`).join('');
      }
    }
  }

  async function loadCategoriesDropdown() {
    const list = document.getElementById('categories-list');
    if (!list) return;
    const data = await apiFetch('/categories');
    if (data && data.categories) {
      list.innerHTML = data.categories.map(c => `
        <a href="/category/${c.slug}" class="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-surface-lighter transition-colors capitalize">${c.name}</a>
      `).join('');
    }
  }

  function initInfiniteScroll() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    loadMoreBtn.addEventListener('click', () => loadArticles(false));
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && STATE.articles.hasMore && !STATE.articles.loading) {
        loadArticles(false);
      }
    }, { rootMargin: '200px' });
    const sentinel = document.getElementById('load-more-container');
    if (sentinel) observer.observe(sentinel);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function initArticlePage() {
    const slug = window.location.pathname.replace('/article/', '');
    if (!slug) return;

    const data = await apiFetch(`/articles/${slug}`);
    if (!data) {
      document.getElementById('article-page').innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold mb-4">Article Not Found</h1><a href="/" class="text-trend-500 hover:underline">Go Home</a></div>';
      return;
    }

    const a = data.article;
    const schemas = data.schemas;

    document.title = a.meta_title || a.title + ' - TrendVolt';
    document.getElementById('meta-title').textContent = a.meta_title || a.title;
    document.getElementById('meta-description').content = a.meta_description || '';
    document.getElementById('og-title').content = a.meta_title || a.title;
    document.getElementById('og-description').content = a.meta_description || '';
    document.getElementById('og-url').content = window.location.href;
    document.getElementById('twitter-title').content = a.meta_title || a.title;
    document.getElementById('twitter-description').content = a.meta_description || '';

    document.getElementById('breadcrumb-category').innerHTML = `<a href="/category/${a.category_slug}" class="hover:text-trend-500 transition-colors">${a.category_name}</a>`;
    document.getElementById('breadcrumb-current').textContent = a.title;

    document.getElementById('article-category').textContent = a.category_name;
    document.getElementById('article-category').className = 'px-3 py-1 bg-trend-500/10 text-trend-500 rounded-full text-sm font-medium';
    document.getElementById('article-date').textContent = formatDate(a.published_at);
    document.getElementById('article-reading-time').textContent = a.reading_time + ' min read';
    document.getElementById('article-views').textContent = (a.view_count || 0) + ' views';
    document.getElementById('article-title').textContent = a.title;

    let content = a.content || '';
    if (a.faqs && a.faqs.length > 0 && schemas && schemas.faq) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemas.faq);
      document.head.appendChild(script);
    }
    if (schemas && schemas.article) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemas.article);
      document.head.appendChild(script);
    }

    document.getElementById('article-body').innerHTML = content;

    if (a.tags) {
      const tags = a.tags.split(',').map(t => t.trim()).filter(Boolean);
      document.getElementById('article-tags').innerHTML = tags.map(t =>
        `<a href="/search?q=${encodeURIComponent(t)}" class="px-3 py-1 bg-gray-100 dark:bg-surface-lighter rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-trend-500/10 hover:text-trend-500 transition-colors">#${t}</a>`
      ).join('');
    }

    if (a.table_of_contents && a.table_of_contents.length > 0) {
      document.getElementById('toc-list').innerHTML = a.table_of_contents.map(item =>
        `<a href="#${item.id}" class="toc-link">${item.text}</a>`
      ).join('');

      document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.getElementById(this.getAttribute('href').substring(1));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        });
      });
    } else {
      document.getElementById('table-of-contents').style.display = 'none';
    }

    if (data.related && data.related.length > 0) {
      const grid = document.getElementById('related-grid');
      const list = document.getElementById('related-list');
      const html = data.related.map(r => `
        <a href="/article/${r.slug}" class="flex gap-3 group">
          <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-trend-400/20 to-purple-500/20 flex-shrink-0 flex items-center justify-center">
            <svg class="w-6 h-6 text-trend-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium group-hover:text-trend-500 transition-colors line-clamp-2">${r.title}</p>
            <p class="text-xs text-gray-500 mt-1">${r.reading_time || 5} min read</p>
          </div>
        </a>
      `).join('');
      if (grid) grid.innerHTML = data.related.map(r => `
        <a href="/article/${r.slug}" class="article-card group">
          <div class="h-36 bg-gradient-to-br from-trend-400/20 to-purple-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-trend-500 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <div class="p-4">
            <p class="text-sm font-semibold group-hover:text-trend-500 transition-colors line-clamp-2">${r.title}</p>
            <p class="text-xs text-gray-500 mt-2">${r.reading_time || 5} min read · ${r.view_count || 0} views</p>
          </div>
        </a>
      `).join('');
      if (list) list.innerHTML = html;
    } else {
      document.getElementById('related-section').style.display = 'none';
    }

    document.querySelectorAll('.loading-skeleton').forEach(el => el.remove());
    document.getElementById('article-content').classList.remove('hidden');
  }

  async function initCategoryPage() {
    const slug = window.location.pathname.replace('/category/', '');
    if (!slug) return;

    const data = await apiFetch(`/categories/${slug}`);
    if (!data) {
      document.querySelector('#app > div:not(nav)').innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold mb-4">Category Not Found</h1><a href="/" class="text-trend-500 hover:underline">Go Home</a></div>';
      return;
    }

    document.title = `${data.category.name} - TrendVolt`;
    document.getElementById('page-title').textContent = `${data.category.name} - TrendVolt`;
    document.getElementById('category-title').textContent = data.category.name;
    document.getElementById('category-description').textContent = data.category.description || `${data.category.name} articles and trending topics`;
    document.getElementById('breadcrumb-cat').textContent = data.category.name;

    const grid = document.getElementById('category-articles');
    if (data.articles && data.articles.length > 0) {
      grid.innerHTML = data.articles.map(a => `
        <a href="/article/${a.slug}" class="article-card group">
          <div class="h-40 bg-gradient-to-br from-trend-400/20 to-purple-500/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-trend-500 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-trend-500 bg-trend-500/10 px-2 py-0.5 rounded">${data.category.name}</span>
              <span class="text-xs text-gray-400">${a.reading_time || 5} min read</span>
            </div>
            <h3 class="font-semibold leading-snug mb-2 group-hover:text-trend-500 transition-colors line-clamp-2">${a.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">${a.excerpt || ''}</p>
            <div class="flex items-center justify-between mt-4 text-xs text-gray-400">
              <span>${formatDate(a.published_at)}</span>
              <span>${a.view_count || 0} views</span>
            </div>
          </div>
        </a>
      `).join('');
    } else {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No articles in this category yet.</div>';
    }
  }

  async function initSearchPage() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const empty = document.getElementById('search-empty');
    if (!input) return;

    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      input.value = queryParam;
      performSearch(queryParam);
    }

    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      const q = this.value.trim();
      if (q.length < 2) {
        results.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }
      timeout = setTimeout(() => performSearch(q), 300);
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const q = this.value.trim();
        if (q.length >= 2) performSearch(q);
      }
    });
  }

  async function performSearch(query) {
    const results = document.getElementById('search-results');
    const empty = document.getElementById('search-empty');
    if (!results) return;

    const data = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
    if (!data) return;

    if (!data.articles || data.articles.length === 0) {
      results.innerHTML = '';
      empty.classList.remove('hidden');
      empty.innerHTML = `
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <p class="text-gray-500 dark:text-gray-400 text-lg">No results for "${query}"</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try different keywords or browse categories</p>`;
      return;
    }

    empty.classList.add('hidden');
    results.innerHTML = data.articles.map(a => `
      <a href="/article/${a.slug}" class="article-card group flex flex-col sm:flex-row">
        <div class="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-trend-400/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-8 h-8 text-trend-500 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <div class="p-5 flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-trend-500 bg-trend-500/10 px-2 py-0.5 rounded">${a.category_name || 'Trending'}</span>
            <span class="text-xs text-gray-400">${a.reading_time || 5} min read</span>
          </div>
          <h3 class="font-semibold text-lg mb-2 group-hover:text-trend-500 transition-colors">${highlightMatch(a.title, query)}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">${a.excerpt || ''}</p>
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>${formatDate(a.published_at)}</span>
            <span>${a.view_count || 0} views</span>
          </div>
        </div>
      </a>
    `).join('') + (data.articles.length >= 20 ? '<div class="text-center pt-4 text-sm text-gray-500">Showing top results. Refine your search for more specific topics.</div>' : '');
  }

  function highlightMatch(text, query) {
    if (!text || !query) return text || '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-trend-500/20 text-trend-500 rounded px-0.5">$1</mark>');
  }

  function initAdminPage() {
    initAdminTabs();
    loadAdminDashboard();
    loadAdminTrends();
    loadAdminArticles();
    loadAdminQueue();
  }

  function initAdminTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        this.classList.add('active');
        const tabId = this.dataset.tab;
        const content = document.getElementById('tab-' + tabId);
        if (content) {
          content.classList.remove('hidden');
          content.classList.add('active');
        }
        if (tabId === 'trends') loadAdminTrends();
        if (tabId === 'articles') loadAdminArticles();
        if (tabId === 'queue') loadAdminQueue();
        if (tabId === 'analytics') loadAdminDashboard();
      });
    });
  }

  async function loadAdminDashboard() {
    const data = await apiFetch('/analytics/summary');
    if (!data) return;

    document.getElementById('stat-articles').textContent = data.totalArticles || 0;
    document.getElementById('stat-views').textContent = (data.totalViews || 0).toLocaleString();
    document.getElementById('stat-trends').textContent = data.totalTrends || 0;
    document.getElementById('stat-subs').textContent = data.totalSubs || 0;

    const chart = document.getElementById('views-chart');
    if (chart && data.recentViews) {
      const max = Math.max(...data.recentViews.map(v => v.views), 1);
      chart.innerHTML = data.recentViews.map(v => {
        const height = (v.views / max) * 100;
        return `<div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-trend-500/20 rounded-t relative" style="height: ${Math.max(height, 4)}%">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">${v.views}</div>
          </div>
          <span class="text-xs text-gray-500">${v.date ? v.date.slice(5) : ''}</span>
        </div>`;
      }).join('');
    }

    const topArt = document.getElementById('top-articles');
    if (topArt && data.topArticles) {
      topArt.innerHTML = data.topArticles.slice(0, 5).map((a, i) => `
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-gray-300 dark:text-gray-600 w-6">${i + 1}</span>
          <div class="flex-1 min-w-0">
            <a href="/article/${a.slug}" class="text-sm font-medium hover:text-trend-500 transition-colors line-clamp-1">${a.title}</a>
          </div>
          <span class="text-sm text-gray-500">${a.view_count}</span>
        </div>
      `).join('');
    }

    if (data.totalArticles > 0) {
      document.getElementById('analytics-avg-views').textContent = Math.round(data.totalViews / data.totalArticles);
    }
    if (data.totalSubs > 0 && data.totalViews > 0) {
      document.getElementById('analytics-conversion').textContent = ((data.totalSubs / data.totalViews) * 100).toFixed(2) + '%';
    }
    document.getElementById('analytics-value').textContent = '$' + ((data.totalViews || 0) * 0.005).toFixed(2);
  }

  async function loadAdminTrends() {
    const tbody = document.getElementById('trends-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Loading...</td></tr>';

    const data = await apiFetch('/trends?limit=30');
    if (!data || !data.trends) return;

    tbody.innerHTML = data.trends.map(t => `
      <tr class="border-b border-gray-100 dark:border-gray-800">
        <td class="px-4 py-3 font-medium">${t.keyword}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold ${t.score >= 85 ? 'bg-green-500/10 text-green-500' : t.score >= 70 ? 'bg-trend-500/10 text-trend-500' : 'bg-yellow-500/10 text-yellow-500'}">${t.score}</span></td>
        <td class="px-4 py-3 text-sm text-gray-500 capitalize">${t.source.replace(/_/g, ' ')}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${t.volume_trend || 'N/A'}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${t.region || 'Global'}</td>
        <td class="px-4 py-3 text-sm">${t.article_count || 0}</td>
        <td class="px-4 py-3">
          <button class="generate-trend-btn text-xs px-3 py-1.5 bg-trend-500 text-white rounded-lg hover:bg-trend-600 transition-colors" data-keyword="${t.keyword}">Generate</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.generate-trend-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        this.textContent = '...';
        this.disabled = true;
        const result = await apiFetch('/trends/generate', {
          method: 'POST',
          body: JSON.stringify({ keyword: this.dataset.keyword })
        });
        this.textContent = 'Generate';
        this.disabled = false;
        if (result && result.article) {
          showToast('Article generated!', 'success');
          loadAdminArticles();
        }
      });
    });
  }

  async function loadAdminArticles() {
    const tbody = document.getElementById('articles-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Loading...</td></tr>';

    const data = await apiFetch('/articles?limit=50');
    if (!data || !data.articles) return;

    tbody.innerHTML = data.articles.map(a => `
      <tr class="border-b border-gray-100 dark:border-gray-800">
        <td class="px-4 py-3"><a href="/article/${a.slug}" class="font-medium hover:text-trend-500 transition-colors line-clamp-1">${a.title}</a></td>
        <td class="px-4 py-3 text-sm text-gray-500">${a.category_name || 'Uncategorized'}</td>
        <td class="px-4 py-3 text-sm">${a.view_count || 0}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-trend-500/10 text-trend-500">${a.trend_score || 'N/A'}</span></td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-500">Published</span></td>
        <td class="px-4 py-3 text-sm text-gray-500">${formatDate(a.published_at)}</td>
        <td class="px-4 py-3">
          <a href="/article/${a.slug}" class="text-xs px-3 py-1.5 bg-gray-200 dark:bg-surface-lighter rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">View</a>
        </td>
      </tr>
    `).join('');
  }

  async function loadAdminQueue() {
    const tbody = document.getElementById('queue-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Loading...</td></tr>';

    const data = await apiFetch('/admin/queue');
    if (!data || !data.queue) return;

    tbody.innerHTML = (data.queue.length === 0
      ? '<tr><td colspan="6" class="text-center py-8 text-gray-500">Queue is empty. Add keywords to generate articles.</td></tr>'
      : data.queue.map(q => `
        <tr class="border-b border-gray-100 dark:border-gray-800">
          <td class="px-4 py-3 font-medium">${q.trend_keyword}</td>
          <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold ${q.priority >= 8 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}">${q.priority}</span></td>
          <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold ${q.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}">${q.status}</span></td>
          <td class="px-4 py-3 text-sm text-gray-500">${q.score || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-500 capitalize">${q.source || 'manual'}</td>
          <td class="px-4 py-3 text-sm text-gray-500">${formatDate(q.created_at)}</td>
        </tr>
      `).join('')
    );
  }

  const pendingBtn = document.getElementById('pending-articles-btn');
  if (pendingBtn) {
    pendingBtn.addEventListener('click', async function() {
      const data = await apiFetch('/admin/articles/pending');
      if (data && data.articles) {
        const tbody = document.getElementById('articles-table-body');
        if (data.articles.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">No pending articles</td></tr>';
          return;
        }
        tbody.innerHTML = data.articles.map(a => `
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <td class="px-4 py-3 font-medium">${a.title}</td>
            <td class="px-4 py-3 text-sm text-gray-500">-</td>
            <td class="px-4 py-3 text-sm">0</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-trend-500/10 text-trend-500">${a.trend_score || 'N/A'}</span></td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500">Draft</span></td>
            <td class="px-4 py-3 text-sm text-gray-500">${formatDate(a.created_at)}</td>
            <td class="px-4 py-3">
              <button class="publish-btn text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" data-id="${a.id}">Publish</button>
            </td>
          </tr>
        `).join('');
        tbody.querySelectorAll('.publish-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            await apiFetch(`/admin/articles/${this.dataset.id}/update`, {
              method: 'POST',
              body: JSON.stringify({ status: 'published' })
            });
            showToast('Article published!', 'success');
            loadAdminArticles();
          });
        });
      }
    });
  }

  const scanBtn = document.getElementById('scan-trends-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', async function() {
      this.textContent = 'Scanning...';
      this.disabled = true;
      await apiFetch('/trends/scan', { method: 'POST' });
      this.textContent = 'Scan Now';
      this.disabled = false;
      showToast('Trends scanned successfully!', 'success');
      loadAdminTrends();
    });
  }

  const generateFromTrendBtn = document.getElementById('generate-from-trend-btn');
  if (generateFromTrendBtn) {
    generateFromTrendBtn.addEventListener('click', async function() {
      const data = await apiFetch('/trends?limit=1');
      if (data && data.trends && data.trends[0]) {
        const result = await apiFetch('/trends/generate', {
          method: 'POST',
          body: JSON.stringify({ keyword: data.trends[0].keyword })
        });
        if (result && result.article) {
          showToast('Article generated from top trend!', 'success');
          loadAdminArticles();
        }
      }
    });
  }

  const addQueueBtn = document.getElementById('add-to-queue-btn');
  if (addQueueBtn) {
    addQueueBtn.addEventListener('click', async function() {
      const input = document.getElementById('queue-keyword-input');
      if (!input || !input.value.trim()) return;
      const result = await apiFetch('/admin/queue/add', {
        method: 'POST',
        body: JSON.stringify({ keyword: input.value.trim() })
      });
      if (result && result.success) {
        showToast('Added to queue!', 'success');
        input.value = '';
        loadAdminQueue();
      }
    });
  }

  const processQueueBtn = document.getElementById('process-queue-btn');
  if (processQueueBtn) {
    processQueueBtn.addEventListener('click', async function() {
      const result = await apiFetch('/admin/queue/process', { method: 'POST' });
      if (result && result.success) {
        showToast('Queue item processed!', 'success');
        loadAdminQueue();
        loadAdminArticles();
      } else if (result && result.message) {
        showToast(result.message, 'info');
      }
    });
  }

  const refreshBtn = document.getElementById('refresh-articles-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAdminArticles());
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => loadArticles(false));
    initInfiniteScroll();
  }

  var SITE_BASE = (function() {
    var p = location.pathname;
    var m = p.match(/^\/([^/]+)\//);
    if (m && m[1] !== 'article' && m[1] !== 'category' && m[1] !== 'search' && m[1] !== 'admin') return '/' + m[1] + '/';
    return '/';
  })();

  function url(path) { return SITE_BASE.replace(/\/$/, '') + path; }

  function fixLinks(root) {
    (root || document).querySelectorAll('a[href^="/"]').forEach(function(a) {
      var h = a.getAttribute('href');
      if (h && h.startsWith('/') && !h.startsWith('//') && !h.startsWith('/api/') && !h.startsWith('/trendvolt/')) {
        a.setAttribute('href', SITE_BASE.replace(/\/$/, '') + h);
      }
    });
  }

  function getRoute() {
    var stored = sessionStorage.getItem('tv_route');
    if (stored) {
      sessionStorage.removeItem('tv_route');
      return stored;
    }
    var p = window.location.pathname;
    var base = '';
    var subdir = p.match(/^\/([^/]+)\//);
    if (subdir && subdir[1] !== 'article' && subdir[1] !== 'category' && subdir[1] !== 'search' && subdir[1] !== 'admin') {
      base = '/' + subdir[1];
      p = p.replace(base, '') || '/';
    }
    var m = p.match(/\/(article|category|search|admin)(\/.*)?$/);
    if (m) {
      var type = m[1];
      var rest = m[2] || '';
      if (type === 'article' && rest) return '/article' + rest;
      if (type === 'category' && rest) return '/category' + rest;
      if (type === 'search') return '/search' + rest;
      if (type === 'admin') return '/admin' + rest;
    }
    return p + (window.location.search || '');
  }

  var route = getRoute();
  var pageInit;
  if (route === '/' || route === '' || route.endsWith('index.html')) {
    pageInit = initHomePage;
  } else if (route.startsWith('/article/')) {
    pageInit = initArticlePage;
  } else if (route.startsWith('/category/')) {
    pageInit = initCategoryPage;
  } else if (route.startsWith('/search')) {
    pageInit = initSearchPage;
  } else if (route.startsWith('/admin')) {
    pageInit = initAdminPage;
  } else {
    pageInit = initHomePage;
  }
  document.addEventListener('DOMContentLoaded', function() {
    pageInit();
    var observer = new MutationObserver(function() { fixLinks(); });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(fixLinks, 300);
    setTimeout(fixLinks, 1000);
  });

  window.TV = { showToast, apiFetch, formatDate };
})();
