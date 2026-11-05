const searchInput = document.getElementById("categorySearch");
const categoryCards = [...document.querySelectorAll(".category-card")];
const emptyState = document.getElementById("emptyState");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    let visible = 0;
    categoryCards.forEach(card => {
      const match = (card.dataset.name + " " + card.innerText).toLowerCase().includes(term);
      card.hidden = !match;
      if (match) visible++;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  });
}
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
const categoryData = {"technology":["Technology","Discover devices, accessories and smart everyday technology."],"fashion":["Fashion & Style","Explore clothing, accessories and personal style essentials."],"home":["Home & Living","Find ideas for furniture, décor, organization and everyday living."],"gaming":["Gaming","Explore gaming accessories, equipment and entertainment products."],"health":["Health & Wellness","Discover everyday wellness, fitness and personal wellbeing products."],"beauty":["Beauty & Care","Explore beauty, grooming and personal care essentials."],"sports":["Sports & Outdoors","Find equipment and accessories for sport, fitness and outdoor activities."],"automotive":["Automotive","Explore vehicle accessories, tools and useful driving essentials."],"books":["Books & Learning","Discover books, learning resources and educational tools."],"pets":["Pets","Explore useful products and accessories for companion animals."],"food":["Food & Kitchen","Find kitchen tools, appliances and cooking essentials."],"adult":["Adult Wellness (18+)","Explore legal adult-only wellness products, subject to retailer and local requirements."],"accessibility":["Disability & Accessibility","Discover assistive products for mobility, hearing, vision and everyday independence."],"hunting":["Hunting & Fishing","Explore legal outdoor, angling and fishing equipment, subject to local regulations."],"marine":["Marine & Boating","Discover boating, diving, snorkeling, navigation and marine safety essentials."],"motorcycles":["Motorcycles","Explore motorcycle parts, protective gear, accessories and maintenance tools."],"agriculture":["Agriculture & Gardening","Discover farming, irrigation, machinery and gardening equipment."]};
const categoryTitle = document.getElementById("categoryTitle");
if (categoryTitle) {
  const key = new URLSearchParams(window.location.search).get("name") || "";
  const item = categoryData[key];
  if (item) {
    document.title = item[0] + " — NOVA MARKET";
    categoryTitle.textContent = item[0];
    document.getElementById("categoryDescription").textContent = item[1];
    if (key === "adult") {
      const adultCollection = document.getElementById("adultCollection");
      const standardCollection = document.getElementById("standardCollection");
      if (adultCollection) adultCollection.hidden = false;
      if (standardCollection) standardCollection.hidden = true;
    }
  } else {
    categoryTitle.textContent = "Collection not found";
    document.getElementById("categoryDescription").textContent = "Please return to all categories and choose a collection.";
  }
}