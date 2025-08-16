import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // replace with your key
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  try {
    const staticPages = [
      { loc: '/', priority: 1.0 },
      { loc: '/recipes', priority: 0.9 },
      { loc: '/equipment', priority: 0.8 },
      { loc: '/about', priority: 0.8 },
    ];

    // Fetch recipes
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    };

  } catch (err) {
    return { statusCode: 500, body: `Error generating sitemap: ${err.message}` };
  }
}
