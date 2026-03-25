import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

/* =================================================
   🔹 Helper Functions
================================================= */

// Get slug from URL
function getSlugFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('slug');
    if (slug) return slug;

    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'index.html' && !lastPart.includes('.')) return lastPart;

    return null;
}

// Show error in the page
function showError(message) {
    const container = document.querySelector('.recipe-page');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc2626;"></i>
                <h2 style="margin-top: 1rem;">Recipe Not Found</h2>
                <p>${message}</p>
                <div style="background: #f5f5f5; padding: 1rem; margin: 1rem; border-radius: 8px; text-align: left;">
                    <strong>Debug Info:</strong><br>
                    Current URL: ${window.location.href}<br>
                    Search String: "${window.location.search}"<br>
                    Pathname: ${window.location.pathname}<br>
                    Try adding: ?slug=simple-egg-roll
                </div>
                <a href="/recipes.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border-radius: 25px; text-decoration: none;">
                    Browse All Recipes
                </a>
            </div>
        `;
    }
}

// Safely parse JSON, return default if invalid
function safeParseJSON(data, defaultValue = []) {
    if (!data) return defaultValue;
    if (Array.isArray(data)) return data;
    try {
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

/* =================================================
   🔹 Main Function: Load Recipe
================================================= */

async function loadRecipe() {
    console.log('=== LOADING RECIPE PAGE ===');

    const slug = getSlugFromUrl();
    if (!slug) {
        showError('No recipe specified. Please add ?slug=recipe-name to the URL');
        return;
    }

    try {
        console.log('Fetching recipe with slug:', slug);

        const { data: recipe, error } = await supabase
            .from('recipe_db')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            showError(`Supabase error: ${error.message}`);
            return;
        }

        if (!recipe) {
            showError(`Recipe "${slug}" not found in database`);
            return;
        }

        console.log('Recipe found:', recipe.title);

        // Update page title
        document.title = `${recipe.title} | Simit Cooks`;
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-description').textContent = recipe.description || '';

        // Recipe meta
        document.getElementById('prep-time').textContent = recipe.prep_time || 'N/A';
        document.getElementById('cook-time').textContent = recipe.cook_time || 'N/A';
        document.getElementById('servings').textContent = recipe.servings || 'N/A';

        // Ingredients
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';
        const ingredients = safeParseJSON(recipe.ingredients);
        if (ingredients.length === 0) ingredientsList.innerHTML = '<li>No ingredients available</li>';
        else ingredients.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ingredientsList.appendChild(li);
        });

        // Method
        const methodList = document.getElementById('method-list');
        methodList.innerHTML = '';
        const methods = safeParseJSON(recipe.method);
        if (methods.length === 0) methodList.innerHTML = '<li>No instructions available</li>';
        else methods.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            methodList.appendChild(li);
        });

        // Nutrition
        const nutritionDiv = document.getElementById('nutrition');
        const nutrition = safeParseJSON(recipe.nutritional_info, {});
        if (Object.keys(nutrition).length === 0) nutritionDiv.textContent = 'Nutrition info not available';
        else {
            nutritionDiv.innerHTML = `
                <strong>Nutrition Information:</strong><br>
                Calories: ${nutrition.calories || 'N/A'}<br>
                Protein: ${nutrition.protein || 'N/A'}<br>
                Carbs: ${nutrition.carbohydrates || 'N/A'}<br>
                Fat: ${nutrition.fat || 'N/A'}
            `;
        }

        // Tags, Cuisine, Category
        document.getElementById('tags').textContent = safeParseJSON(recipe.tags).join(', ') || 'N/A';
        document.getElementById('cuisine').textContent = safeParseJSON(recipe.cuisine).join(', ') || 'N/A';
        document.getElementById('category').textContent = safeParseJSON(recipe.category).join(', ') || 'N/A';

        // Notes & Facts
        document.getElementById('notes').textContent = recipe.notes || 'No notes available';
        document.getElementById('facts').textContent = recipe.facts || 'No fun facts available';

        // Video
        const videoContainer = document.querySelector('.recipe-video');
        if (recipe.video_url) {
            const videoMatch = recipe.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (videoMatch) {
                const embedUrl = `https://www.youtube.com/embed/${videoMatch[1]}`;
                videoContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>`;
            } else {
                videoContainer.textContent = 'Video URL not valid';
            }
        } else {
            videoContainer.textContent = 'No video available';
        }

        console.log('✅ Recipe displayed successfully');

    } catch (err) {
        console.error('Unexpected error:', err);
        showError(`Failed to load recipe: ${err.message}`);
    }
}

/* =================================================
   🔹 Init
================================================= */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecipe);
} else {
    loadRecipe();
}
