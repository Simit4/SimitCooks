import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


async function generateSitemap() {
  // Fetch all recipe slugs
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('slug');

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  recipes.forEach(recipe => {
    xml += `  <url>\n`;
    xml += `    <loc>https://simitswaad.netlify.app/recipe.html?slug=${recipe.slug}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <priority>0.80</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  // Save to public folder
  fs.writeFileSync('public/sitemap.xml', xml);
  console.log('Sitemap generated!');
}

generateSitemap();
