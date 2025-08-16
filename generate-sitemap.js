import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


const staticPages = [
  { loc: '/', priority: 1.0 },
  { loc: '/recipes', priority: 0.9 },
  { loc: '/equipment', priority: 0.8 },
  { loc: '/about', priority: 0.8 },
];

async function generateFullSitemap() {
  try {
    // Fetch all recipes from Supabase
    const { data: recipes, error } = await supabase
      .from('recipe_db')
      .select('slug');

    if (error) throw error;

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>https://simitswaad.netlify.app${page.loc}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add recipe pages
    recipes.forEach(recipe => {
      xml += `  <url>\n`;
      xml += `    <loc>https://simitswaad.netlify.app/recipe/${recipe.slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    fs.writeFileSync('sitemap.xml', xml);
    console.log('✅ Full sitemap generated with main pages + recipes!');
  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
  }
}

generateFullSitemap();
