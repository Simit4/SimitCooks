import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const BASE_URL = 'https://simitcooks.netlify.app'; // Updated domain
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  try {
    // Static pages
    const staticPages = [
      { loc: '/', priority: 1.0 },
      { loc: '/recipes', priority: 0.9 },
      { loc: '/equipment', priority: 0.8 },
      { loc: '/about', priority: 0.8 },
    ];

    // Fetch recipes from Supabase
    const { data: recipes, error } = await supabase
      .from('recipe_db')
      .select('slug, created_at, updated_at');

    if (error) throw error;

    // Start XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const now = new Date().toISOString();

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add dynamic recipe pages
    recipes.forEach(recipe => {
      const lastMod = recipe.updated_at || recipe.created_at || now;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/recipe/${recipe.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(lastMod).toISOString()}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Error generating sitemap: ${err.message}`,
    };
  }
}
