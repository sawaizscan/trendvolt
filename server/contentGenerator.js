const db = require('./database');
const slugify = require('slugify');
const trendEngine = require('./trendEngine');

const ARTICLE_TEMPLATES = {
  'explainer': {
    titlePattern: 'What Is {keyword} and Why Is Everyone Talking About It?',
    sections: ['introduction', 'what_is_it', 'why_trending', 'how_it_works', 'key_players', 'impact', 'future_outlook', 'faq'],
    wordCount: 1500
  },
  'why_trending': {
    titlePattern: 'Why Is {keyword} Trending? Everything You Need to Know',
    sections: ['introduction', 'the_origin', 'why_now', 'viral_factors', 'public_reaction', 'expert_opinions', 'whats_next', 'faq'],
    wordCount: 1200
  },
  'listicle': {
    titlePattern: 'Top 10 Things to Know About {keyword} in 2024',
    sections: ['introduction', ...Array.from({length: 10}, (_, i) => `item_${i + 1}`), 'conclusion', 'faq'],
    wordCount: 2000
  },
  'comparison': {
    titlePattern: '{keyword} vs Alternatives: Which One Should You Choose?',
    sections: ['introduction', 'what_is_keyword', 'alternatives', 'comparison_table', 'pros_cons', 'verdict', 'faq'],
    wordCount: 1800
  },
  'tutorial': {
    titlePattern: 'How to Master {keyword}: A Complete Beginner\'s Guide',
    sections: ['introduction', 'prerequisites', 'step_1', 'step_2', 'step_3', 'step_4', 'step_5', 'tips', 'troubleshooting', 'faq'],
    wordCount: 2500
  },
  'news': {
    titlePattern: 'Breaking: Latest Updates on {keyword} You Need to Know',
    sections: ['introduction', 'the_news', 'context', 'analysis', 'impact', 'reaction', 'whats_next', 'faq'],
    wordCount: 1000
  },
  'prediction': {
    titlePattern: '{keyword} Predictions for 2024 and Beyond',
    sections: ['introduction', 'current_state', 'short_term', 'medium_term', 'long_term', 'expert_quotes', 'preparation', 'faq'],
    wordCount: 1500
  }
};

const MOCK_ARTICLES = {
  'AI agents': {
    title: 'AI Agents Explained: How Autonomous AI Systems Are Transforming Technology in 2024',
    content: `<h2>What Are AI Agents?</h2>
<p>AI agents represent a revolutionary leap forward in artificial intelligence technology. Unlike traditional AI systems that simply respond to commands, AI agents are autonomous software programs capable of perceiving their environment, making decisions, and taking actions to achieve specific goals without constant human intervention.</p>
<p>Think of AI agents as your digital workforce - they can plan, execute tasks, learn from outcomes, and adapt their strategies accordingly. From scheduling meetings to writing code, AI agents are being deployed across industries to automate complex workflows that previously required human judgement.</p>

<h2>Why AI Agents Are Trending Now</h2>
<p>The explosion of interest in AI agents can be traced to several key developments in 2024. Major tech companies including OpenAI, Google, Microsoft, and Anthropic have released frameworks that make it easier to build and deploy AI agents. Open-source projects like AutoGPT, BabyAGI, and CrewAI have democratized access to agent technology.</p>
<p>Social media platforms, particularly X (formerly Twitter) and Reddit, have seen viral discussions about AI agents completing increasingly sophisticated tasks. YouTube tutorials on building AI agents have accumulated millions of views, indicating a massive wave of interest from developers and businesses alike.</p>

<h2>How AI Agents Work</h2>
<p>At their core, AI agents operate on a perception-action loop. They:</p>
<ul>
<li><strong>Perceive:</strong> Gather data from their environment through APIs, web scraping, or user input</li>
<li><strong>Reason:</strong> Use large language models to analyze information and formulate plans</li>
<li><strong>Act:</strong> Execute tasks by calling tools, writing code, or interacting with external systems</li>
<li><strong>Learn:</strong> Incorporate feedback to improve future performance</li>
</ul>

<h2>Key Players in the AI Agent Space</h2>
<p>The AI agent ecosystem is rapidly evolving with contributions from both tech giants and innovative startups. OpenAI's GPT-4 with function calling capabilities enables sophisticated agent behaviors. Microsoft's Copilot ecosystem embeds AI agents directly into productivity tools. Startups like Cognition AI (Devin) are pushing the boundaries of what autonomous coding agents can achieve.</p>

<h2>Real-World Applications</h2>
<p>AI agents are already being used for:</p>
<ul>
<li><strong>Software Development:</strong> Autonomous coding agents can write, test, and debug code</li>
<li><strong>Customer Support:</strong> AI agents handle complex support tickets end-to-end</li>
<li><strong>Data Analysis:</strong> Autonomous agents can gather data, run analysis, and generate reports</li>
<li><strong>Content Creation:</strong> Multi-agent systems collaborate to research and produce content</li>
<li><strong>Business Automation:</strong> Agents manage workflows across multiple tools and platforms</li>
</ul>

<h2>The Future of AI Agents</h2>
<p>Industry experts predict that AI agents will become as ubiquitous as mobile apps within the next five years. The trend toward agentic AI represents a fundamental shift from tools that assist humans to systems that can act independently on behalf of humans. As models become more capable and frameworks more robust, we can expect AI agents to handle increasingly complex and nuanced tasks.</p>

<h2>Frequently Asked Questions</h2>
<div class="faq-item"><h3>What exactly is an AI agent?</h3><p>An AI agent is an autonomous software program that can perceive its environment, make decisions, and take actions to achieve goals without constant human guidance.</p></div>
<div class="faq-item"><h3>How are AI agents different from chatbots?</h3><p>While chatbots respond to queries, AI agents take independent action. They can plan multi-step tasks, use tools, execute code, and learn from outcomes.</p></div>
<div class="faq-item"><h3>Are AI agents safe?</h3><p>Safety depends on proper implementation. Leading frameworks include guardrails, human oversight mechanisms, and constraint systems to ensure responsible agent behavior.</p></div>
<div class="faq-item"><h3>Can I build my own AI agent?</h3><p>Yes! Open-source frameworks like AutoGPT, CrewAI, and LangChain make it accessible to build custom AI agents with basic programming knowledge.</p></div>
<div class="faq-item"><h3>What industries will AI agents impact most?</h3><p>Customer service, software development, data analysis, healthcare administration, and financial services are seeing the earliest and most significant transformations.</p></div>`
  },
  'Quantum computing breakthrough': {
    title: 'Quantum Computing Breakthrough 2024: The Race to Quantum Supremacy Heats Up',
    content: `<h2>The Quantum Revolution Accelerates</h2>
<p>Quantum computing has reached a pivotal moment in 2024. Multiple breakthroughs have pushed the technology closer to practical, real-world applications that could revolutionize industries from drug discovery to cryptography. The race for quantum supremacy - the point where quantum computers can solve problems impossible for classical computers - has intensified dramatically.</p>

<h2>Why This Matters Now</h2>
<p>Google's recent demonstration of a quantum error correction milestone, IBM's expansion of its quantum processor roadmap, and startups delivering quantum-as-a-service solutions have collectively created unprecedented momentum. The convergence of improved hardware, better error correction, and growing investment has made quantum computing one of the most talked-about technology trends of 2024.</p>

<h2>Recent Breakthroughs</h2>
<p>Several landmark achievements have marked 2024 as a watershed year:</p>
<ul>
<li><strong>Error Correction Milestone:</strong> Google Quantum AI demonstrated that adding more qubits can actually reduce errors, solving a decades-old challenge</li>
<li><strong>IBM's Quantum Roadmap:</strong> IBM announced its 1,000+ qubit processor, Condor, and detailed plans for quantum-centric supercomputing</li>
<li><strong>Logical Qubits:</strong> Multiple teams successfully demonstrated logical qubits with error rates low enough for practical computation</li>
<li><strong>Quantum Networking:</strong> Advances in quantum entanglement distribution are laying groundwork for a quantum internet</li>
</ul>

<h2>Applications on the Horizon</h2>
<p>The promise of quantum computing extends across industries. In pharmaceuticals, quantum simulations could model molecular interactions with unprecedented accuracy, dramatically accelerating drug discovery. In finance, quantum algorithms could optimize portfolio management and risk assessment. In materials science, quantum computers could design new materials with desired properties from first principles.</p>

<h2>The Competitive Landscape</h2>
<p>Major technology companies and government-backed initiatives are investing heavily in quantum computing. The United States, China, and European Union have each committed billions of dollars to quantum research. IBM, Google, Microsoft, and Amazon are racing alongside startups like IonQ, Rigetti, and Xanadu to deliver practical quantum advantage.</p>

<h2>Challenges Ahead</h2>
<p>Despite remarkable progress, significant challenges remain. Scaling quantum systems to thousands of logical qubits, maintaining coherence times, and developing error-corrected algorithms all require further breakthroughs. The timeline for practical quantum advantage remains debated, with estimates ranging from 2-10 years for specific applications.</p>

<h2>Frequently Asked Questions</h2>
<div class="faq-item"><h3>What is quantum computing?</h3><p>Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform computations that would be impractical for classical computers.</p></div>
<div class="faq-item"><h3>When will quantum computers be useful?</h3><p>Some applications may achieve practical advantage within 2-5 years, particularly in optimization and simulation. Broad utility is expected within 5-10 years.</p></div>
<div class="faq-item"><h3>Will quantum computers replace classical computers?</h3><p>No, quantum computers will complement classical computers, excelling at specific types of problems while classical systems handle everyday computing needs.</p></div>
<div class="faq-item"><h3>How can I learn about quantum computing?</h3><p>IBM offers free quantum computing courses through Qiskit, and Google provides access to quantum hardware through its Quantum AI platform for researchers.</p></div>`
  },
  'AI coding tools': {
    title: 'Best AI Coding Tools in 2024: The Ultimate Guide to AI-Powered Development',
    content: `<h2>The AI Coding Revolution</h2>
<p>AI-powered coding tools have transformed software development in 2024. From intelligent code completion to autonomous programming agents, these tools are making developers more productive than ever before. The market for AI coding assistants has exploded, with millions of developers now using AI tools as part of their daily workflow.</p>

<h2>Top AI Coding Tools</h2>
<h3>1. GitHub Copilot</h3>
<p>Microsoft's GitHub Copilot remains the most popular AI coding assistant, now featuring GPT-4 integration, multi-line suggestions, and support for virtually every programming language. Its ability to understand context across files makes it invaluable for complex projects.</p>

<h3>2. Cursor</h3>
<p>The AI-first code editor has gained a massive following for its deep understanding of entire codebases and ability to make multi-file edits. Cursor's Chat interface allows developers to ask questions about their code and receive contextually aware responses.</p>

<h3>3. Claude (Anthropic)</h3>
<p>Anthropic's Claude has emerged as a powerful coding companion, particularly excelling at code review, debugging, and explaining complex code. Its 200K token context window allows it to analyze entire codebases in a single prompt.</p>

<h3>4. Cline</h3>
<p>An open-source AI coding assistant that runs entirely in the terminal, Cline has gained popularity for its ability to autonomously plan and execute complex software engineering tasks.</p>

<h3>5. Amazon CodeWhisperer</h3>
<p>AWS's offering has matured significantly, offering real-time code suggestions with particular strength in cloud-native development and AWS service integration.</p>

<h2>How to Choose the Right Tool</h2>
<p>Selecting the best AI coding tool depends on your specific needs. Consider factors like language support, IDE integration, context window size, pricing, and whether you need local or cloud-based processing. Many developers use multiple tools for different aspects of their workflow.</p>

<h2>The Impact on Development</h2>
<p>AI coding tools have fundamentally changed how software is built. Developers report 2-3x productivity improvements for tasks like boilerplate generation, testing, and documentation. More importantly, these tools allow developers to focus on architectural decisions and creative problem-solving rather than routine coding tasks.</p>

<h2>Frequently Asked Questions</h2>
<div class="faq-item"><h3>Are AI coding tools worth the cost?</h3><p>For most professional developers, the productivity gains far exceed the subscription costs, often paying for themselves within days.</p></div>
<div class="faq-item"><h3>Do AI coding tools replace developers?</h3><p>No, they augment developer capabilities. Human oversight, architectural decisions, and creative problem-solving remain essential.</p></div>
<div class="faq-item"><h3>Which AI coding tool is best for beginners?</h3><p>GitHub Copilot and Cursor are excellent choices for beginners due to their intuitive interfaces and comprehensive documentation.</p></div>
<div class="faq-item"><h3>Can AI coding tools work with any language?</h3><p>Most tools support all major languages, but performance varies. Python, JavaScript, TypeScript, and Rust generally have the best support.</p></div>`
  }
};

const SAMPLE_CATEGORIES = [
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'AI news, trends, and analysis', icon: 'brain' },
  { name: 'Technology', slug: 'technology', description: 'General technology news and reviews', icon: 'cpu' },
  { name: 'Science', slug: 'science', description: 'Scientific discoveries and breakthroughs', icon: 'flask' },
  { name: 'Business', slug: 'business', description: 'Business and startup news', icon: 'briefcase' },
  { name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', icon: 'bitcoin' },
  { name: 'Gaming', slug: 'gaming', description: 'Gaming news and reviews', icon: 'gamepad' },
  { name: 'Social Media', slug: 'social-media', description: 'Social media trends and news', icon: 'share' },
  { name: 'Tech Reviews', slug: 'tech-reviews', description: 'In-depth tech product reviews', icon: 'star' },
];

function generateSlug(title) {
  return slugify(title, { lower: true, strict: true });
}

function generateMetaDescription(content, keyword) {
  const sentences = content.split('.').filter(s => s.trim().length > 30);
  if (sentences.length > 0) {
    let desc = sentences[0].trim();
    if (desc.length > 155) desc = desc.substring(0, 152) + '...';
    return desc;
  }
  return `Discover everything about ${keyword} - trending insights, analysis, and expert perspectives.`;
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function generateTableOfContents(content) {
  const headings = content.match(/<h[23][^>]*>(.*?)<\/h[23]>/g) || [];
  return headings.map(h => {
    const text = h.replace(/<[^>]*>/g, '').trim();
    const id = slugify(text, { lower: true });
    return { text, id };
  });
}

function addHeadingIds(content) {
  return content.replace(/<(h[23])>(.*?)<\/\1>/g, (match, tag, text) => {
    const id = slugify(text, { lower: true });
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

function generateArticleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    author: { '@type': 'Organization', name: 'TrendVolt' },
    publisher: { '@type': 'Organization', name: 'TrendVolt', logo: { '@type': 'ImageObject', url: `${process.env.SITE_URL || 'http://localhost:3000'}/images/logo.png` } },
    datePublished: article.published_at || new Date().toISOString(),
    dateModified: article.updated_at || new Date().toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.SITE_URL || 'http://localhost:3000'}/article/${article.slug}` },
    image: article.featured_image || `${process.env.SITE_URL || 'http://localhost:3000'}/images/default-article.jpg`
  };
}

function extractFAQs(content) {
  const faqRegex = /<div class="faq-item"><h3>(.*?)<\/h3><p>(.*?)<\/p><\/div>/g;
  const faqs = [];
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    faqs.push({ question: match[1], answer: match[2] });
  }
  return faqs;
}

function generateArticle(keyword, template = 'explainer') {
  const normalizedKeyword = keyword.toLowerCase().trim();
  const matchKey = Object.keys(MOCK_ARTICLES).find(k => normalizedKeyword.includes(k));
  const mockArticle = matchKey ? MOCK_ARTICLES[matchKey] : null;

  if (mockArticle) {
    const content = addHeadingIds(mockArticle.content);
    const tableOfContents = generateTableOfContents(content);
    const faqs = extractFAQs(content);
    const metaDescription = generateMetaDescription(content, keyword);
    const readingTime = calculateReadingTime(content);

    return {
      title: mockArticle.title,
      content,
      metaTitle: mockArticle.title,
      metaDescription,
      tableOfContents,
      readingTime,
      faqs,
      faqSchema: generateFAQSchema(faqs),
      articleSchema: null
    };
  }

  const titlePattern = ARTICLE_TEMPLATES[template]?.titlePattern || 'Everything About {keyword}: Complete Guide 2024';
  const title = titlePattern.replace(/{keyword}/g, keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

  const introParagraph = `${keyword} has become one of the most discussed topics across the internet in recent weeks. From social media platforms to news outlets, everyone is talking about this rapidly evolving subject. In this comprehensive guide, we'll explore everything you need to know about ${keyword}, including why it matters, how it works, and what the future holds.`;
  const bodyParagraphs = [
    `The growing interest in ${keyword} represents a significant shift in how we think about technology and its impact on daily life. Industry experts have noted that the momentum behind ${keyword} is unprecedented, with search volumes reaching new highs across multiple platforms and regions.`,
    `What makes ${keyword} particularly noteworthy is its potential to reshape existing paradigms. Early adopters and innovators in this space are already demonstrating practical applications that suggest we're only seeing the beginning of what's possible.`,
    `Critics and skeptics have raised important questions about ${keyword}, particularly around implementation challenges and long-term implications. However, the overwhelming consensus among experts is that the benefits substantially outweigh the risks, especially as the technology continues to mature.`,
    `For businesses and individuals looking to stay ahead of the curve, understanding ${keyword} is no longer optional. Whether you're a professional in the field or simply curious about emerging trends, having a solid grasp of this topic will prove increasingly valuable.`
  ];

  const faqs = [
    { question: `What is ${keyword}?`, answer: `${keyword} refers to the emerging trend that has captured significant attention across the internet and media landscape. It represents a developing phenomenon with potentially far-reaching implications.` },
    { question: `Why is ${keyword} trending?`, answer: `Multiple factors have contributed to the trending status of ${keyword}, including recent developments, media coverage, and growing public interest across social media platforms.` },
    { question: `How can I learn more about ${keyword}?`, answer: `Following reputable news sources, industry publications, and expert analysis on platforms like X (Twitter), Reddit, and specialized forums will help you stay informed about ${keyword}.` },
    { question: `What's the future of ${keyword}?`, answer: `While predictions vary, most experts agree that ${keyword} will continue to evolve and influence related fields, with several major developments expected in the coming months.` }
  ];

  const content = addHeadingIds(`<h2>Introduction</h2>
<p>${introParagraph}</p>
${bodyParagraphs.map((p, i) => `<h2>${['Understanding the Trend', 'Why This Matters Now', 'Expert Perspectives', 'Practical Implications'][i] || 'Key Insights'}</h2>\n<p>${p}</p>`).join('\n')}
<h2>Frequently Asked Questions</h2>
${faqs.map(f => `<div class="faq-item"><h3>${f.question}</h3><p>${f.answer}</p></div>`).join('\n')}`);

  const tableOfContents = generateTableOfContents(content);
  const metaDescription = generateMetaDescription(content, keyword);
  const readingTime = calculateReadingTime(content);

  return {
    title,
    content,
    metaTitle: title,
    metaDescription,
    tableOfContents,
    readingTime,
    faqs,
    faqSchema: generateFAQSchema(faqs),
    articleSchema: null
  };
}

function getCategories() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existing.count === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)');
    const tx = db.transaction(() => {
      for (const cat of SAMPLE_CATEGORIES) {
        insert.run(cat.name, cat.slug, cat.description, cat.icon);
      }
    });
    tx();
  }
  return db.prepare('SELECT * FROM categories ORDER BY article_count DESC').all();
}

function getRelatedArticles(articleId, categoryId, limit = 4) {
  return db.prepare(`
    SELECT id, title, slug, excerpt, featured_image, published_at, reading_time, view_count
    FROM articles
    WHERE id != ? AND category_id = ? AND status = 'published'
    ORDER BY view_count DESC
    LIMIT ?
  `).all(articleId, categoryId, limit);
}

function createArticleFromTrend(trend) {
  const template = ['explainer', 'why_trending', 'listicle', 'tutorial', 'news'][Math.floor(Math.random() * 5)];
  const generated = generateArticle(trend.keyword, template);
  const slug = generateSlug(generated.title);
  const categoryId = assignCategory(trend.keyword);

  const existingArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
  if (existingArticle) return existingArticle.id;

  const articleSchema = generateArticleSchema({
    title: generated.title,
    slug,
    meta_description: generated.metaDescription,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const result = db.prepare(`
    INSERT INTO articles (title, slug, meta_title, meta_description, content, excerpt, category_id, tags,
      status, trend_score, source, keywords, reading_time, featured_image, image_alt, is_trending, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
  `).run(
    generated.title,
    slug,
    generated.metaTitle,
    generated.metaDescription,
    generated.content,
    generated.metaDescription.substring(0, 150),
    categoryId,
    trend.keyword,
    trend.score || 50,
    trend.source || 'trendvolt',
    trend.keyword,
    generated.readingTime,
    `/api/placeholder/800/400?text=${encodeURIComponent(trend.keyword)}`,
    `Image representing ${trend.keyword}`,
  );

  if (generated.faqSchema) {
    db.prepare(`UPDATE articles SET content = content || '<!--faq_schema-->' WHERE id = ?`).run(result.lastInsertRowid);
  }

  return result.lastInsertRowid;
}

function assignCategory(keyword) {
  const categories = db.prepare('SELECT id, name FROM categories').all();
  const keywordLower = keyword.toLowerCase();

  const categoryMap = [
    { keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'gpt', 'openai', 'llm'], categoryName: 'Artificial Intelligence' },
    { keywords: ['quantum', 'computing', 'tech', 'software', 'hardware', 'programming', 'coding', 'developer', 'app', 'startup'], categoryName: 'Technology' },
    { keywords: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'nft', 'defi', 'web3'], categoryName: 'Crypto' },
    { keywords: ['science', 'research', 'study', 'discovery', 'space', 'nasa', 'physics', 'biology'], categoryName: 'Science' },
    { keywords: ['business', 'startup', 'funding', 'market', 'economy', 'investment', 'stock'], categoryName: 'Business' },
    { keywords: ['gaming', 'game', 'playstation', 'xbox', 'nintendo', 'pc gaming'], categoryName: 'Gaming' },
    { keywords: ['social', 'twitter', 'reddit', 'instagram', 'tiktok', 'youtube', 'influencer'], categoryName: 'Social Media' },
    { keywords: ['review', 'best', 'top', 'vs', 'comparison', 'guide', 'tutorial'], categoryName: 'Tech Reviews' },
  ];

  for (const mapping of categoryMap) {
    if (mapping.keywords.some(k => keywordLower.includes(k))) {
      const cat = categories.find(c => c.name === mapping.categoryName);
      if (cat) return cat.id;
    }
  }

  return categories[1]?.id || 1;
}

function getAllArticles(limit = 50, offset = 0, categorySlug = null) {
  let query = `
    SELECT a.id, a.title, a.slug, a.meta_description as excerpt, a.featured_image,
      a.reading_time, a.view_count, a.published_at, a.trend_score, a.is_trending,
      c.name as category_name, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
  `;
  const params = [];

  if (categorySlug) {
    query += ' AND c.slug = ?';
    params.push(categorySlug);
  }

  query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params);
}

function getArticleBySlug(slug) {
  const article = db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ?
  `).get(slug);

  if (article) {
    article.table_of_contents = generateTableOfContents(article.content);
    article.faqs = extractFAQs(article.content);

    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(article.id);
  }

  return article;
}

function searchArticles(query, limit = 20) {
  return db.prepare(`
    SELECT a.id, a.title, a.slug, a.meta_description as excerpt, a.featured_image,
      a.reading_time, a.published_at, c.name as category_name, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
      AND (a.title LIKE ? OR a.content LIKE ? OR a.keywords LIKE ?)
    ORDER BY a.trend_score DESC
    LIMIT ?
  `).all(`%${query}%`, `%${query}%`, `%${query}%`, limit);
}

function seedSampleData() {
  getCategories();
  const trends = trendEngine.getTopTrends(10);
  if (trends.length === 0) {
    const mockTrends = [
      { keyword: 'AI agents explained', score: 95, source: 'google_trends' },
      { keyword: 'Quantum computing breakthrough 2024', score: 88, source: 'google_trends' },
      { keyword: 'Best AI coding tools', score: 92, source: 'google_trends' },
      { keyword: 'Neuralink update', score: 85, source: 'reddit' },
      { keyword: 'Apple Vision Pro apps', score: 80, source: 'techcrunch' },
      { keyword: 'AI video generation', score: 94, source: 'twitter' },
      { keyword: 'Bitcoin price prediction', score: 88, source: 'crypto' },
      { keyword: 'Rust vs Go 2024', score: 86, source: 'hacker_news' },
      { keyword: 'AI startup funding 2024', score: 93, source: 'techcrunch' },
      { keyword: 'OpenAI GPT-5 rumors', score: 91, source: 'reddit' },
    ];
    const insert = db.prepare('INSERT OR IGNORE INTO trends (keyword, source, score, status) VALUES (?, ?, ?, ?)');
    const tx = db.transaction(() => {
      for (const t of mockTrends) {
        insert.run(t.keyword, t.source, t.score, 'detected');
      }
    });
    tx();
  }

  const articles = db.prepare('SELECT COUNT(*) as count FROM articles').get();
  if (articles.count === 0) {
    const trendsToGenerate = db.prepare('SELECT * FROM trends ORDER BY score DESC LIMIT 8').all();
    for (const trend of trendsToGenerate) {
      createArticleFromTrend(trend);
    }
  }
}

module.exports = {
  generateArticle,
  getAllArticles,
  getArticleBySlug,
  searchArticles,
  getCategories,
  getRelatedArticles,
  createArticleFromTrend,
  generateSlug,
  generateMetaDescription,
  generateArticleSchema,
  generateFAQSchema,
  extractFAQs,
  seedSampleData
};
