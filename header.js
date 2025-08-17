const categories = ["Nepali", "Chinese", "Snacks", "Desserts"];
const categoryMenu = document.getElementById("category-menu");

categories.forEach(cat => {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = `recipes.html?category=${cat.toLowerCase()}`;
  a.textContent = cat;
  li.appendChild(a);
  categoryMenu.appendChild(li);
});

// Live search functionality
const searchInput = document.getElementById("recipe-search");
searchInput.addEventListener("input", function() {
  const query = this.value.toLowerCase();
  const recipeCards = document.querySelectorAll(".recipe-card");
  recipeCards.forEach(card => {
    const title = card.querySelector(".recipe-title").textContent.toLowerCase();
    card.style.display = title.includes(query) ? "block" : "none";
  });
});
