const MOCK_TRENDS = [
  {
    source: 'google_trends',
    trends: [
      { keyword: 'AI agents explained', score: 95, volume: '1M+', region: 'Global' },
      { keyword: 'Quantum computing breakthrough 2024', score: 88, volume: '500K+', region: 'US' },
      { keyword: 'Best AI coding tools', score: 92, volume: '750K+', region: 'Global' },
      { keyword: 'Neuralink update', score: 85, volume: '600K+', region: 'US' },
      { keyword: 'Apple Vision Pro apps', score: 80, volume: '400K+', region: 'Global' },
    ]
  },
  {
    source: 'reddit',
    trends: [
      { keyword: 'OpenAI GPT-5 rumors', score: 91, volume: '2K+ discussions', region: 'Global' },
      { keyword: 'Self-driving cars 2024', score: 78, volume: '1.5K+ discussions', region: 'Global' },
      { keyword: 'Best programming language 2024', score: 82, volume: '3K+ discussions', region: 'Global' },
      { keyword: 'AI art controversy', score: 87, volume: '5K+ discussions', region: 'Global' },
      { keyword: 'Tech layoffs 2024', score: 90, volume: '10K+ discussions', region: 'US' },
    ]
  },
  {
    source: 'hacker_news',
    trends: [
      { keyword: 'Rust vs Go 2024', score: 86, volume: '500+ points', region: 'Global' },
      { keyword: 'New CSS features 2024', score: 75, volume: '300+ points', region: 'Global' },
      { keyword: 'WebAssembly production', score: 79, volume: '400+ points', region: 'Global' },
    ]
  },
  {
    source: 'techcrunch',
    trends: [
      { keyword: 'AI startup funding 2024', score: 93, volume: 'Featured', region: 'Global' },
      { keyword: 'SpaceX Stars launch', score: 84, volume: 'Featured', region: 'Global' },
      { keyword: 'Apple AI features', score: 89, volume: 'Featured', region: 'Global' },
    ]
  },
  {
    source: 'twitter',
    trends: [
      { keyword: 'AI video generation', score: 94, volume: '100K+ posts', region: 'Global' },
      { keyword: 'New iPhone release', score: 83, volume: '200K+ posts', region: 'Global' },
      { keyword: 'Cryptocurrency rally', score: 81, volume: '150K+ posts', region: 'Global' },
    ]
  },
  {
    source: 'youtube',
    trends: [
      { keyword: 'AI tutorial for beginners', score: 90, volume: '5M+ views', region: 'Global' },
      { keyword: 'Tech product reviews', score: 76, volume: '3M+ views', region: 'Global' },
      { keyword: 'Programming projects', score: 77, volume: '4M+ views', region: 'Global' },
    ]
  },
  {
    source: 'crypto',
    trends: [
      { keyword: 'Bitcoin price prediction', score: 88, volume: '1M+ searches', region: 'Global' },
      { keyword: 'Ethereum upgrade', score: 79, volume: '500K+ searches', region: 'Global' },
      { keyword: 'DeFi trends 2024', score: 74, volume: '300K+ searches', region: 'Global' },
    ]
  }
];

async function fetchMockTrends() {
  return MOCK_TRENDS;
}

async function fetchGoogleTrends() {
  return MOCK_TRENDS.find(t => t.source === 'google_trends').trends;
}

async function fetchRedditTrends() {
  return MOCK_TRENDS.find(t => t.source === 'reddit').trends;
}

async function fetchHackerNewsTrends() {
  return MOCK_TRENDS.find(t => t.source === 'hacker_news').trends;
}

async function fetchTechCrunchTrends() {
  return MOCK_TRENDS.find(t => t.source === 'techcrunch').trends;
}

async function fetchTwitterTrends() {
  return MOCK_TRENDS.find(t => t.source === 'twitter').trends;
}

async function fetchYouTubeTrends() {
  return MOCK_TRENDS.find(t => t.source === 'youtube').trends;
}

async function fetchCryptoTrends() {
  return MOCK_TRENDS.find(t => t.source === 'crypto').trends;
}

module.exports = {
  fetchMockTrends,
  fetchGoogleTrends,
  fetchRedditTrends,
  fetchHackerNewsTrends,
  fetchTechCrunchTrends,
  fetchTwitterTrends,
  fetchYouTubeTrends,
  fetchCryptoTrends,
  MOCK_TRENDS
};
