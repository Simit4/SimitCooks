// Dynamic Categories & Live Search
const categories = ["Nepali", "Chinese", "Snacks", "Desserts"];
const categoryMenu = document.getElementById("category-menu");

if (categoryMenu) {
  categories.forEach(cat => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `recipes.html?category=${cat.toLowerCase()}`;
    a.textContent = cat;
    li.appendChild(a);
    categoryMenu.appendChild(li);
  });
}

const searchInput = document.getElementById("recipe-search");
if (searchInput) {
  searchInput.addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const recipeCards = document.querySelectorAll(".recipe-card");
    recipeCards.forEach(card => {
      const titleElem = card.querySelector(".recipe-title");
      card.style.display = titleElem.textContent.toLowerCase().includes(query) ? "block" : "none";
    });
  });
}
