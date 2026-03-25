import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get slug from URL
function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Show error message
function showError(message) {
    const container = document.querySelector('.recipe-page');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc2626;"></i>
                <h2 style="margin-top: 1rem;">Recipe Not Found</h2>
                <p>${message}</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                    Try: /recipe/index.html?slug=simple-egg-roll
                </p>
                <a href="/recipes.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border-radius: 25px; text-decoration: none;">
                    <i class="fas fa-arrow-left"></i> Browse All Recipes
                </a>
            </div>
        `;
    }
}

// Load and display recipe
async function loadRecipe() {
    console.log('🚀 Recipe page loading...');
    
    const slug = getSlugFromUrl();
    console.log('📝 Slug from URL:', slug);
    
    if (!slug) {
        showError('No recipe specified. Please add ?slug=recipe-name to the URL');
        return;
    }
    
    try {
        // Show loading state
        const titleEl = document.getElementById('recipe-title');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading recipe...';
        
        // Fetch recipe from Supabase
        console.log('📡 Fetching recipe:', slug);
        const { data: recipe, error } = await supabase
            .from('recipe_db')
            .select('*')
            .eq('slug', slug)
            .single();
        
        if (error) {
            console.error('❌ Supabase error:', error);
            showError(`Error: ${error.message}`);
            return;
        }
        
        if (!recipe) {
            console.error('❌ No recipe found for slug:', slug);
            showError(`Recipe "${slug}" not found`);
            return;
        }
        
        console.log('✅ Recipe loaded:', recipe.title);
        
        // Set page title
        document.title = `${recipe.title} | Simit Cooks`;
        
        // =================================================
        // 🔹 Basic Info
        // =================================================
        
        if (titleEl) titleEl.textContent = recipe.title;
        
        const descEl = document.getElementById('recipe-description');
        if (descEl) descEl.textContent = recipe.description || '';
        
        const prepEl = document.getElementById('prep-time');
        if (prepEl) prepEl.textContent = recipe.prep_time || 'N/A';
        
        const cookEl = document.getElementById('cook-time');
        if (cookEl) cookEl.textContent = recipe.cook_time || 'N/A';
        
        const servingsEl = document.getElementById('servings');
        if (servingsEl) servingsEl.textContent = recipe.servings || 'N/A';
        
        // =================================================
        // 🔹 Ingredients
        // =================================================
        
        const ingredientsList = document.getElementById('ingredients-list');
        if (ingredientsList) {
            ingredientsList.innerHTML = '';
            let ingredients = recipe.ingredients;
            
            if (typeof ingredients === 'string') {
                try {
                    ingredients = JSON.parse(ingredients);
                } catch(e) {
                    console.error('Failed to parse ingredients:', e);
                    ingredients = [];
                }
            }
            
            if (Array.isArray(ingredients) && ingredients.length > 0) {
                ingredients.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ingredientsList.appendChild(li);
                });
            } else {
                ingredientsList.innerHTML = '<li>No ingredients listed</li>';
            }
        }
        
        // =================================================
        // 🔹 Method
        // =================================================
        
        const methodList = document.getElementById('method-list');
        if (methodList) {
            methodList.innerHTML = '';
            let methods = recipe.method;
            
            if (typeof methods === 'string') {
                try {
                    methods = JSON.parse(methods);
                } catch(e) {
                    console.error('Failed to parse method:', e);
                    methods = [];
                }
            }
            
            if (Array.isArray(methods) && methods.length > 0) {
                methods.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    methodList.appendChild(li);
                });
            } else {
                methodList.innerHTML = '<li>No instructions available</li>';
            }
        }
        
        // =================================================
        // 🔹 Nutrition
        // =================================================
        
        const nutritionDiv = document.getElementById('nutrition');
        if (nutritionDiv && recipe.nutritional_info) {
            let nutrition = recipe.nutritional_info;
            
            if (typeof nutrition === 'string') {
                try {
                    nutrition = JSON.parse(nutrition);
                } catch(e) {
                    console.error('Failed to parse nutrition:', e);
                    nutrition = {};
                }
            }
            
            if (nutrition && Object.keys(nutrition).length > 0) {
                nutritionDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem;">
                        ${nutrition.calories ? `<div><strong>🔥 Calories:</strong><br>${nutrition.calories}</div>` : ''}
                        ${nutrition.protein ? `<div><strong>💪 Protein:</strong><br>${nutrition.protein}</div>` : ''}
                        ${nutrition.carbohydrates ? `<div><strong>🍚 Carbs:</strong><br>${nutrition.carbohydrates}</div>` : ''}
                        ${nutrition.fat ? `<div><strong>🥑 Fat:</strong><br>${nutrition.fat}</div>` : ''}
                        ${nutrition.fiber ? `<div><strong>🌾 Fiber:</strong><br>${nutrition.fiber}</div>` : ''}
                    </div>
                `;
            }
        }
        
        // =================================================
        // 🔹 Tags, Cuisine, Category
        // =================================================
        
        const tagsSpan = document.getElementById('tags');
        if (tagsSpan && recipe.tags) {
            let tags = recipe.tags;
            if (typeof tags === 'string') tags = JSON.parse(tags);
            tagsSpan.textContent = Array.isArray(tags) ? tags.join(', ') : 'Not available';
        }
        
        const cuisineSpan = document.getElementById('cuisine');
        if (cuisineSpan && recipe.cuisine) {
            let cuisine = recipe.cuisine;
            if (typeof cuisine === 'string') cuisine = JSON.parse(cuisine);
            cuisineSpan.textContent = Array.isArray(cuisine) ? cuisine.join(', ') : 'Not available';
        }
        
        const categorySpan = document.getElementById('category');
        if (categorySpan && recipe.category) {
            let category = recipe.category;
            if (typeof category === 'string') category = JSON.parse(category);
            categorySpan.textContent = Array.isArray(category) ? category.join(', ') : 'Not available';
        }
        
        // =================================================
        // 🔹 Notes & Facts
        // =================================================
        
        const notesEl = document.getElementById('notes');
        if (notesEl) notesEl.textContent = recipe.notes || 'No additional notes available.';
        
        const factsEl = document.getElementById('facts');
        if (factsEl) factsEl.textContent = recipe.facts || 'No fun facts found.';
        
        // =================================================
        // 🔹 Video
        // =================================================
        
        const embedUrl = convertToEmbedUrl(recipe.video_url);
        const videoContainer = document.querySelector('.recipe-video');
        if (videoContainer) {
            if (embedUrl) {
                videoContainer.innerHTML = `
                    <iframe 
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
                videoContainer.style.display = 'block';
            } else {
                videoContainer.style.display = 'none';
            }
        }
        
        // =================================================
        // 🔹 Equipment
        // =================================================
        
        if (recipe.equipment_ids && recipe.equipment_ids.length > 0) {
            try {
                const { data: equipment, error: equipError } = await supabase
                    .from('equipment_db')
                    .select('*')
                    .in('id', recipe.equipment_ids);
                
                const equipmentContainer = document.getElementById('equipment-container');
                if (equipmentContainer && equipment && !equipError && equipment.length > 0) {
                    equipmentContainer.innerHTML = '';
                    equipment.forEach(item => {
                        const equipmentDiv = document.createElement('div');
                        equipmentDiv.className = 'equipment-item';
                        equipmentDiv.innerHTML = `
                            <div class="image-wrapper">
                                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : '<div style="padding: 2rem; text-align: center;">No image</div>'}
                                <div class="overlay">
                                    <p>${item.description || 'Essential kitchen tool'}</p>
                                </div>
                            </div>
                            <h3>${item.name}</h3>
                            ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now →</a>` : ''}
                        `;
                        equipmentContainer.appendChild(equipmentDiv);
                    });
                }
            } catch (err) {
                console.error('Error loading equipment:', err);
            }
        }
        
        // =================================================
        // 🔹 Update View Count
        // =================================================
        
        supabase
            .from('recipe_db')
            .update({ views: (recipe.views || 0) + 1 })
            .eq('id', recipe.id)
            .then(() => console.log('✅ View count updated'))
            .catch(err => console.error('Error updating views:', err));
        
        console.log('🎉 Recipe rendered successfully');
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError(`Failed to load recipe: ${error.message}`);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecipe);
} else {
    loadRecipe();
}
