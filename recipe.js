import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// SIMPLE: Get slug from URL
function getSlugFromUrl() {
    // Method 1: Check query parameters
    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('slug');
    
    if (slug) {
        console.log('✅ Found slug in query params:', slug);
        return slug;
    }
    
    // Method 2: Check if URL has /recipe/slug format
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'index.html' && !lastPart.includes('.')) {
        console.log('✅ Found slug in path:', lastPart);
        return lastPart;
    }
    
    console.log('❌ No slug found in URL');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    return null;
}

// Show error with URL info
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

// Load recipe
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
            showError(`Error: ${error.message}`);
            return;
        }
        
        if (!recipe) {
            console.error('No recipe found');
            showError(`Recipe "${slug}" not found in database`);
            return;
        }
        
        console.log('Recipe found:', recipe.title);
        
        // Display recipe
        document.title = `${recipe.title} | Simit Cooks`;
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-description').textContent = recipe.description || '';
        document.getElementById('prep-time').textContent = recipe.prep_time || 'N/A';
        document.getElementById('cook-time').textContent = recipe.cook_time || 'N/A';
        document.getElementById('servings').textContent = recipe.servings || 'N/A';
        
        // Ingredients
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';
        let ingredients = recipe.ingredients;
        if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
        ingredients.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ingredientsList.appendChild(li);
        });
        
        // Method
        const methodList = document.getElementById('method-list');
        methodList.innerHTML = '';
        let methods = recipe.method;
        if (typeof methods === 'string') methods = JSON.parse(methods);
        methods.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            methodList.appendChild(li);
        });
        
        // Nutrition
        let nutrition = recipe.nutritional_info;
        if (typeof nutrition === 'string') nutrition = JSON.parse(nutrition);
        const nutritionDiv = document.getElementById('nutrition');
        if (nutrition) {
            nutritionDiv.innerHTML = `
                <strong>Nutrition Information:</strong><br>
                Calories: ${nutrition.calories || 'N/A'}<br>
                Protein: ${nutrition.protein || 'N/A'}<br>
                Carbs: ${nutrition.carbohydrates || 'N/A'}<br>
                Fat: ${nutrition.fat || 'N/A'}
            `;
        }
        
        // Tags
        let tags = recipe.tags;
        if (typeof tags === 'string') tags = JSON.parse(tags);
        document.getElementById('tags').textContent = tags ? tags.join(', ') : 'N/A';
        
        // Cuisine
        let cuisine = recipe.cuisine;
        if (typeof cuisine === 'string') cuisine = JSON.parse(cuisine);
        document.getElementById('cuisine').textContent = cuisine ? cuisine.join(', ') : 'N/A';
        
        // Category
        let category = recipe.category;
        if (typeof category === 'string') category = JSON.parse(category);
        document.getElementById('category').textContent = category ? category.join(', ') : 'N/A';
        
        // Notes
        document.getElementById('notes').textContent = recipe.notes || 'No notes available';
        document.getElementById('facts').textContent = recipe.facts || 'No fun facts available';
        
        // Video
        if (recipe.video_url) {
            const videoMatch = recipe.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (videoMatch) {
                const embedUrl = `https://www.youtube.com/embed/${videoMatch[1]}`;
                const videoContainer = document.querySelector('.recipe-video');
                if (videoContainer) {
                    videoContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>`;
                }
            }
        }
        
        console.log('✅ Recipe displayed successfully');
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to load recipe: ${error.message}`);
    }
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecipe);
} else {
    loadRecipe();
}
