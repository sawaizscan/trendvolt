require('dotenv').config();
const db = require('./database');
const contentGen = require('./contentGenerator');

console.log('Seeding TrendVolt database with sample data...');

contentGen.seedSampleData();

const articleCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'published'").get().count;
const trendCount = db.prepare('SELECT COUNT(*) as count FROM trends').get().count;
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;

console.log(`\n  ✓ ${categoryCount} categories created`);
console.log(`  ✓ ${trendCount} trends detected`);
console.log(`  ✓ ${articleCount} articles generated and published`);
console.log('\nDone! Start the server with: npm start\n');
