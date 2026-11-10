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
const categoryData = {"technology":["Technology","Discover devices, accessories and smart everyday technology."],"fashion":["Fashion & Style","Explore clothing, accessories and personal style essentials."],"home":["Home & Living","Find ideas for furniture, décor, organization and everyday living."],"gaming":["Gaming","Explore gaming accessories, equipment and entertainment products."],"health":["Health & Wellness","Discover everyday wellness, fitness and personal wellbeing products."],"beauty":["Beauty & Care","Explore beauty, grooming and personal care essentials."],"sports":["Sports & Outdoors","Find equipment and accessories for sport, fitness and outdoor activities."],"automotive":["Automotive","Explore vehicle accessories, tools and useful driving essentials."],"books":["Books & Learning","Discover books, learning resources and educational tools."],"pets":["Pets","Explore useful products and accessories for companion animals."],"food":["Food & Kitchen","Find kitchen tools, appliances and cooking essentials."],"restaurant-equipment":["Restaurant & Café Equipment","Explore professional equipment for restaurants, cafés, bakeries and commercial kitchens."],"medical-equipment":["Medical & Hospital Equipment","Explore hospital furniture, diagnostic and monitoring equipment, sterilization systems and professional medical supplies. Medicines and regulated devices require separate legal and licensing checks before listing."],"medical-tools":["Medical Instruments & Tools","Explore professional examination, diagnostic, surgical and clinical instruments. Restricted or regulated devices and instruments require licensing and destination-country compliance checks before listing."],"adult":["Adult Wellness (18+)","Explore legal adult-only wellness products, subject to retailer and local requirements."],"accessibility":["Disability & Accessibility","Discover assistive products for mobility, hearing, vision and everyday independence."],"hunting":["Hunting & Fishing","Explore legal outdoor, angling and fishing equipment, subject to local regulations."],"marine":["Marine & Boating","Discover boating, diving, snorkeling, navigation and marine safety essentials."],"motorcycles":["Motorcycles","Explore motorcycle parts, protective gear, accessories and maintenance tools."],"agriculture":["Agriculture & Gardening","Discover farming, irrigation, machinery and gardening equipment."]};
const categorySubcategories = {"restaurant-equipment":["Commercial ovens, stoves & fryers","Commercial refrigerators & freezers","Coffee, espresso & juice machines","Food preparation, mixers & cutters","Stainless-steel tables, sinks & shelving","Professional cookware, utensils & serving equipment","Bakery & pastry equipment"],"medical-equipment":["Hospital beds, stretchers & examination tables","Patient monitors, ECG & vital-sign devices","Diagnostic equipment & imaging accessories","Sterilization, autoclaves & infection-control equipment","Medical furniture, trolleys & storage","PPE, dressings & non-prescription medical consumables","Mobility, rehabilitation & patient-care equipment","Pharmacy refrigerators and medical storage"],"medical-tools":["Stethoscopes, blood-pressure cuffs & thermometers","Otoscope, ophthalmoscope & examination tools","Surgical scissors, forceps, clamps & retractors","Suture and wound-care instruments","Diagnostic and measurement instruments","Dental examination and hand instruments","Reusable instrument trays and sterilization containers"]};
const categoryTitle = document.getElementById("categoryTitle");
if (categoryTitle) {
  const key = new URLSearchParams(window.location.search).get("name") || "";
  const item = categoryData[key];
  if (item) {
    document.title = item[0] + " — NOVA MARKET";
    categoryTitle.textContent = item[0];
    document.getElementById("categoryDescription").textContent = item[1];
    const subcategoryList = document.getElementById("categorySubcategories");
    if (subcategoryList && categorySubcategories[key]) {
      const heading = document.createElement("h2");
      heading.textContent = "Browse subcategories";
      const list = document.createElement("ul");
      categorySubcategories[key].forEach(label => { const li = document.createElement("li"); li.textContent = label; list.append(li); });
      subcategoryList.append(heading, list);
    }
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

// NOVA MARKET catalogue foundation.
// Keep this array empty until each listing has a verified seller page, price,
// availability and clearly stated shipping coverage. Never invent affiliate URLs.
const catalogProducts = [];
const catalogGrid = document.getElementById("catalogGrid");
if (catalogGrid) {
  const standardCollectionPanel = document.getElementById("standardCollection");
  if (standardCollectionPanel) standardCollectionPanel.hidden = true;
  const catalogSearch = document.getElementById("catalogSearch");
  const catalogSort = document.getElementById("catalogSort");
  const catalogCount = document.getElementById("catalogCount");
  const catalogEmpty = document.getElementById("catalogEmpty");
  const currentCategory = new URLSearchParams(window.location.search).get("name") || "";
  const renderCatalog = () => {
    const term = (catalogSearch?.value || "").trim().toLowerCase();
    let items = catalogProducts.filter(product =>
      (!currentCategory || product.category === currentCategory) &&
      (product.title + " " + product.description + " " + product.brand).toLowerCase().includes(term)
    );
    if (catalogSort?.value === "price-low") items.sort((a,b) => a.price - b.price);
    if (catalogSort?.value === "price-high") items.sort((a,b) => b.price - a.price);
    catalogGrid.replaceChildren();
    items.forEach(product => {
      const card = document.createElement("article");
      card.className = "catalog-card";
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.title;
      image.loading = "lazy";
      const body = document.createElement("div");
      body.className = "catalog-card-body";
      const brand = document.createElement("small");
      brand.textContent = product.brand;
      const title = document.createElement("h3");
      title.textContent = product.title;
      const description = document.createElement("p");
      description.textContent = product.description;
      const price = document.createElement("strong");
      price.textContent = product.priceLabel;
      const seller = document.createElement("a");
      seller.href = product.sellerUrl;
      seller.target = "_blank";
      seller.rel = "noopener noreferrer sponsored";
      seller.textContent = product.affiliate ? "View offer" : "Visit seller";
      body.append(brand,title,description,price,seller);
      card.append(image,body);
      catalogGrid.append(card);
    });
    if (catalogCount) catalogCount.textContent = items.length + (items.length === 1 ? " listing" : " listings");
    if (catalogEmpty) catalogEmpty.hidden = items.length > 0;
  };
  catalogSearch?.addEventListener("input", renderCatalog);
  catalogSort?.addEventListener("change", renderCatalog);
  renderCatalog();
}
