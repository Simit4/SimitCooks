import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// 🔹 Replace with your Supabase details
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("slug, updated_at");

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }

  const recipeUrls = recipes.map(r => `
  <url>
    <loc>https://simitswaad.netlify.app/recipe.html?slug=${r.slug}</loc>
    <lastmod>${new Date(r.updated_at).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`);

  const staticUrls = `
  <url>
    <loc>https://simitswaad.netlify.app/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://simitswaad.netlify.app/recipes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://simitswaad.netlify.app/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://simitswaad.netlify.app/equipment</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.6</priority>
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${recipeUrls.join("\n")}
</urlset>`;

  fs.writeFileSync("public/sitemap.xml", sitemap);
  console.log("✅ Sitemap generated successfully!");
}

generateSitemap();

