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
const categoryData = {"technology":["Technology","Discover devices, accessories and smart everyday technology."],"fashion":["Fashion & Style","Explore clothing, accessories and personal style essentials."],"home":["Home & Living","Find ideas for furniture, décor, organization and everyday living."],"gaming":["Gaming","Explore gaming accessories, equipment and entertainment products."],"health":["Health & Wellness","Discover everyday wellness, fitness and personal wellbeing products."],"beauty":["Beauty & Care","Explore beauty, grooming and personal care essentials."],"sports":["Sports & Outdoors","Find equipment and accessories for sport, fitness and outdoor activities."],"automotive":["Automotive","Explore vehicle accessories, tools and useful driving essentials."],"books":["Books & Learning","Discover books, learning resources and educational tools."],"pets":["Pets","Explore useful products and accessories for companion animals."],"food":["Food & Kitchen","Find kitchen tools, appliances and cooking essentials."],"restaurant-equipment":["Restaurant & Café Equipment","Explore professional equipment for restaurants, cafés, bakeries and commercial kitchens."],"medical-equipment":["Medical & Hospital Equipment","Explore hospital furniture, diagnostic and monitoring equipment, sterilization systems and professional medical supplies. Medicines and regulated devices require separate legal and licensing checks before listing."],"medical-tools":["Medical Instruments & Tools","Explore professional examination, diagnostic, surgical and clinical instruments. Restricted or regulated devices and instruments require licensing and destination-country compliance checks before listing."],"adult":["Adult Wellness (18+)","Explore legal adult-only wellness products, subject to retailer and local requirements."],"accessibility":["Disability & Accessibility","Discover assistive products for mobility, hearing, vision and everyday independence."],"hunting":["Hunting & Fishing","Explore legal outdoor, angling and fishing equipment, subject to local regulations."],"marine":["Marine & Boating","Discover boating, diving, snorkeling, navigation and marine safety essentials."],"motorcycles":["Motorcycles","Explore motorcycle parts, protective gear, accessories and maintenance tools."],"agriculture":["Agriculture & Gardening","Discover farming, irrigation, machinery and gardening equipment."],"baby-kids":["Baby & Kids","Explore baby care, nursery furniture, strollers, children’s clothing and age-appropriate products."],"toys-hobbies":["Toys & Hobbies","Discover educational toys, games, collectibles, crafts and hobby supplies."],"office-business":["Office & Business","Find office furniture, printers, business equipment and workplace essentials."],"school-stationery":["School & Stationery","Explore school supplies, stationery, backpacks, art materials and learning accessories."],"industrial-tools":["Industrial Tools & Machinery","Discover workshop tools, measuring equipment, machinery and professional maintenance supplies."],"building-materials":["Building & Construction Materials","Explore construction materials, insulation, pipes, flooring and building hardware."],"electrical-energy":["Electrical & Energy","Find electrical components, cables, circuit protection, solar equipment and energy storage products."],"cleaning-laundry":["Cleaning & Laundry","Explore cleaning machines, vacuum cleaners, laundry equipment and cleaning accessories."],"travel-luggage":["Travel & Luggage","Discover suitcases, travel bags, organizers and travel accessories."],"musical-instruments":["Musical Instruments","Explore instruments, audio equipment, recording accessories and music learning tools."],"packaging-supplies":["Packaging & Supplies","Find packaging materials, shipping supplies, containers and packing equipment."],"hotel-equipment":["Hotel Equipment","Explore hotel furniture, room supplies, linens and hospitality equipment."]};
const categorySubcategories = {"home":["Ceramic & porcelain tiles","Bathroom and kitchen tiles","Sanitary ware, sinks & faucets","Flooring, parquet & wall coverings","Paints, coatings & wallpapers","Lighting, chandeliers & decorative lamps","Curtains, carpets & rugs","Home décor, mirrors & wall art","Furniture and home accessories","Doors, handles & interior fittings"],"restaurant-equipment":["Commercial ovens, stoves & fryers","Commercial refrigerators & freezers","Coffee, espresso & juice machines","Food preparation, mixers & cutters","Stainless-steel tables, sinks & shelving","Professional cookware, utensils & serving equipment","Bakery & pastry equipment"],"medical-equipment":["Hospital beds, stretchers & examination tables","Patient monitors, ECG & vital-sign devices","Diagnostic equipment & imaging accessories","Sterilization, autoclaves & infection-control equipment","Medical furniture, trolleys & storage","PPE, dressings & non-prescription medical consumables","Mobility, rehabilitation & patient-care equipment","Pharmacy refrigerators and medical storage"],"medical-tools":["Stethoscopes, blood-pressure cuffs & thermometers","Otoscope, ophthalmoscope & examination tools","Surgical scissors, forceps, clamps & retractors","Suture and wound-care instruments","Diagnostic and measurement instruments","Dental examination and hand instruments","Reusable instrument trays and sterilization containers"]};
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
      const arabicLabels = {"Strollers, car seats & carriers":"عربات الأطفال ومقاعد السيارة وحمالات الرضّع","Baby feeding, nursing & care":"الرضاعة والتغذية والعناية بالرضّع","Cribs, bassinets & nursery furniture":"أسرّة ومهد وأثاث غرف الأطفال","Baby monitors & safety gates":"أجهزة مراقبة الرضّع وبوابات السلامة","Diapers, changing & bath essentials":"الحفاضات وتغيير الملابس والاستحمام","Children’s clothing & footwear":"ملابس وأحذية الأطفال","Age-appropriate toys & learning products":"ألعاب ومنتجات تعليمية مناسبة للأعمار","Educational toys & building sets":"الألعاب التعليمية ومكعبات التركيب","Board games, puzzles & cards":"الألعاب اللوحية والألغاز والبطاقات","Outdoor play & ride-on toys":"ألعاب الهواء الطلق وألعاب الركوب","Dolls, figures & collectibles":"الدمى والمجسمات والمقتنيات","Arts, crafts & DIY hobbies":"الفنون والأشغال اليدوية والهوايات","Model kits & hobby accessories":"نماذج التركيب وإكسسوارات الهوايات","Office desks, chairs & workstations":"مكاتب وكراسٍ ومحطات عمل","Printers, scanners & copiers":"الطابعات والماسحات وآلات النسخ","Paper shredders & laminators":"آلات إتلاف الورق والتغليف الحراري","Office electronics & accessories":"إلكترونيات المكتب وملحقاتها","Filing, storage & organization":"الأرشفة والتخزين والتنظيم","POS and business equipment":"أجهزة نقاط البيع ومعدات الأعمال","Notebooks, paper & planners":"الدفاتر والورق والمخططات","Pens, pencils & writing supplies":"الأقلام ومستلزمات الكتابة","School bags & pencil cases":"حقائب مدرسية ومقالم","Art, craft & drawing supplies":"مستلزمات الرسم والفنون والأشغال","Calculators & learning tools":"الآلات الحاسبة وأدوات التعلم","Classroom and teaching supplies":"مستلزمات الأقسام والتعليم","Hand tools & tool sets":"الأدوات اليدوية ومجموعاتها","Power tools & accessories":"الأدوات الكهربائية وملحقاتها","Measuring, testing & inspection tools":"أدوات القياس والاختبار والفحص","Workshop machines & compressors":"آلات الورش والضواغط","Welding and metalworking equipment":"معدات اللحام وتشغيل المعادن","Pneumatic and hydraulic tools":"الأدوات الهوائية والهيدروليكية","Workshop storage & safety equipment":"تخزين الورش ومعدات السلامة","Cement, mortar & construction mixes":"الإسمنت والملاط وخلطات البناء","Insulation and waterproofing":"العزل والعزل المائي","Pipes, fittings & plumbing materials":"الأنابيب والوصلات ومواد السباكة","Lumber, panels & roofing":"الأخشاب والألواح ومواد الأسقف","Doors, windows & building hardware":"الأبواب والنوافذ ولوازم البناء","Drywall, ceilings & wall systems":"الجبس والأسقف وأنظمة الجدران","Construction tools and site supplies":"أدوات البناء ومستلزمات الورش","Electrical cables & wiring accessories":"الكابلات وملحقات التوصيل الكهربائي","Switches, sockets & lighting controls":"المفاتيح والمقابس ومفاتيح التحكم بالإضاءة","Circuit breakers, panels & protection":"قواطع الكهرباء واللوحات والحماية","Solar panels & inverters":"الألواح الشمسية والمحولات","Batteries & energy storage":"البطاريات وتخزين الطاقة","Generators & backup power":"المولدات والطاقة الاحتياطية","Electrical installation tools":"أدوات التركيبات الكهربائية","Vacuum cleaners & floor care":"المكانس الكهربائية والعناية بالأرضيات","Commercial cleaning machines":"آلات التنظيف التجارية","Pressure washers & steam cleaners":"أجهزة الغسل بالضغط والتنظيف بالبخار","Washing machines & dryers":"الغسالات والمجففات","Laundry presses & ironing equipment":"معدات كيّ وضغط الملابس","Cleaning carts, tools & accessories":"عربات وأدوات وإكسسوارات التنظيف","Suitcases & cabin luggage":"حقائب السفر وحقائب المقصورة","Travel backpacks & duffel bags":"حقائب الظهر وحقائب السفر الرياضية","Laptop and business travel bags":"حقائب الحاسوب وسفر الأعمال","Packing cubes & organizers":"مكعبات التعبئة والمنظمات","Travel accessories & security":"إكسسوارات السفر والأمان","Outdoor and camping travel gear":"معدات الرحلات والتخييم","Guitars, basses & string instruments":"الغيتارات وآلات الباس والآلات الوترية","Keyboards, pianos & synthesizers":"لوحات المفاتيح والبيانو والسنثسيزر","Drums & percussion":"الطبول وآلات الإيقاع","Wind and brass instruments":"آلات النفخ والنحاسيات","Microphones, mixers & speakers":"الميكروفونات وأجهزة المزج ومكبرات الصوت","Recording and studio equipment":"معدات التسجيل والاستوديو","Instrument cases, stands & accessories":"حقائب الآلات وحواملها وملحقاتها","Shipping boxes & cartons":"صناديق وكراتين الشحن","Protective wraps, foam & fillers":"الأغلفة الواقية والرغوة ومواد الحشو","Mailers, bags & envelopes":"أكياس وأظرف الشحن","Labels, tape & sealing supplies":"الملصقات والأشرطة ومستلزمات الإغلاق","Bottles, jars & containers":"القوارير والمرطبانات والحاويات","Packing, sealing & strapping machines":"آلات التعبئة والإغلاق والربط","Hotel beds, mattresses & headboards":"أسرّة ومراتب ورؤوس أسرّة الفنادق","Hotel linens, towels & bedding":"مفروشات ومناشف وأغطية الفنادق","Room furniture & storage":"أثاث الغرف والتخزين","Housekeeping carts & supplies":"عربات ومستلزمات التدبير الفندقي","Hotel kitchen and buffet equipment":"معدات مطابخ الفنادق والبوفيه","Reception and lobby furniture":"أثاث الاستقبال والردهة","Guest-room appliances & amenities":"أجهزة ومستلزمات غرف النزلاء","Ceramic & porcelain tiles":"بلاط السيراميك والبورسلان","Bathroom and kitchen tiles":"سيراميك الحمامات والمطابخ","Sanitary ware, sinks & faucets":"الأدوات الصحية والأحواض والحنفيات","Flooring, parquet & wall coverings":"الأرضيات والباركيه وكسوة الجدران","Paints, coatings & wallpapers":"الدهانات وورق الجدران والطلاء","Lighting, chandeliers & decorative lamps":"الإضاءة والثريات والمصابيح الديكورية","Curtains, carpets & rugs":"الستائر والسجاد والزرابي","Home décor, mirrors & wall art":"ديكور المنزل والمرايا ولوحات الجدران","Furniture and home accessories":"الأثاث وإكسسوارات المنزل","Doors, handles & interior fittings":"الأبواب والمقابض وتجهيزات الديكور الداخلي"};
      categorySubcategories[key].forEach(label => { const li = document.createElement("li"); li.textContent = document.documentElement.lang === "ar" ? (arabicLabels[label] || label) : label; list.append(li); });
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
      const media = document.createElement("div");
      media.className = "nova-watermark-wrap";
      const videoUrl = product.videoUrl || product.video_url || "";
      let mediaElement;
      if (videoUrl) {
        mediaElement = document.createElement("video");
        mediaElement.src = videoUrl;
        mediaElement.controls = true;
        mediaElement.playsInline = true;
        mediaElement.preload = "metadata";
        mediaElement.setAttribute("aria-label", product.title);
      } else {
        mediaElement = document.createElement("img");
        mediaElement.src = product.image;
        mediaElement.alt = product.title;
        mediaElement.loading = "lazy";
      }
      const watermark = document.createElement("span");
      watermark.className = "nova-watermark";
      watermark.textContent = "NOVA MARKET";
      const priceBadge = document.createElement("span");
      priceBadge.className = "nova-price-badge";
      priceBadge.textContent = product.priceLabel || "";
      media.append(mediaElement, watermark);
      if (priceBadge.textContent) media.append(priceBadge);
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
      body.append(brand,title,description,seller);
      card.append(media,body);
      catalogGrid.append(card);
    });
    if (catalogCount) catalogCount.textContent = items.length + (items.length === 1 ? " listing" : " listings");
    if (catalogEmpty) catalogEmpty.hidden = items.length > 0;
  };
  catalogSearch?.addEventListener("input", renderCatalog);
  catalogSort?.addEventListener("change", renderCatalog);
  renderCatalog();
}
