/* The plates on the field.

   Eighteen of them, kept deliberately few so the page stays open and
   each one gets room. The other twenty are still in assets/img and are
   listed further down — move a line up into PLATES to bring it back.

   'kind' is "photo" for photographs and renders, "draw" for line and
   pencil work.

   'ground: "white"' marks the pieces that were shot or scanned against a
   white sheet. Those, and every drawing, are multiplied into the page, so
   the sheet falls away and only the work is left. Photographs with their
   own ground — renders, the site plans, anything dark — must not carry it,
   or the page would eat into the picture itself. */
window.PLATES = [
  { src: "assets/img/bloom-model-hands.jpg",      w: 1200, h:  810, kind: "photo",  ground: "white", project: "bloom on spring",   year: "2024",  title: "physical model in hand" },
  { src: "assets/img/bloom-render-levels.jpg",    w: 1200, h:  928, kind: "photo", project: "bloom on spring",   year: "2024",  title: "render, all three levels" },
  { src: "assets/img/bloom-render-garden.jpg",    w: 1195, h:  740, kind: "photo", project: "bloom on spring",   year: "2024",  title: "render, the sensory garden" },
  { src: "assets/img/bloom-model-roof.jpg",       w:  829, h:  580, kind: "photo",  ground: "white", project: "bloom on spring",   year: "2024",  title: "the water-collecting roof" },
  { src: "assets/img/bloom-plan.jpg",             w: 1200, h: 1116, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "ground floor plan" },
  { src: "assets/img/bloom-section.jpg",          w: 1200, h:  773, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "north facing perspective section" },
  { src: "assets/img/harvest-model-hand.jpg",     w: 1200, h:  725, kind: "photo",  ground: "white", project: "harvest hub",       year: "2024",  title: "physical model in hand" },
  { src: "assets/img/harvest-greenhouse.jpg",     w:  800, h: 1156, kind: "photo",  ground: "white", project: "harvest hub",       year: "2024",  title: "the greenhouse, model" },
  { src: "assets/img/harvest-interior.jpg",       w:  682, h:  712, kind: "photo", project: "harvest hub",       year: "2024",  title: "inside the greenhouse" },
  { src: "assets/img/harvest-sectioncut.jpg",     w: 1200, h:  514, kind: "draw",  project: "harvest hub",       year: "2024",  title: "perspective section cut" },
  { src: "assets/img/nha-render.jpg",             w: 1200, h: 1189, kind: "photo", project: "nhà",               year: "2025",  title: "the floating village" },
  { src: "assets/img/nha-siteplan.jpg",           w: 1200, h:  913, kind: "photo", project: "nhà",               year: "2025",  title: "site plan" },
  { src: "assets/img/nha-photo.jpg",              w:  510, h:  342, kind: "photo", project: "nhà",               year: "2025",  title: "stilt houses, Mekong Delta" },
  { src: "assets/img/nha-structure.jpg",          w:  202, h:  242, kind: "draw",  project: "nhà",               year: "2025",  title: "floating structure" },
  { src: "assets/img/knot-model.jpg",             w: 1200, h: 1141, kind: "photo",  ground: "white", project: "knot",              year: "2025",  title: "physical model" },
  { src: "assets/img/knot-groundplan.jpg",        w:  681, h:  686, kind: "draw",  project: "knot",              year: "2025",  title: "ground plan" },
  { src: "assets/img/bloom-model-plan.jpg",       w: 1200, h:  928, kind: "photo",  ground: "white", project: "bloom on spring",   year: "2024",  title: "physical model, interior" },
  { src: "assets/img/nha-modules.jpg",            w: 1200, h:  473, kind: "photo",  ground: "white", project: "nhà",               year: "2025",  title: "module plans" },
];

/* Held back, not deleted. */
window.PLATES_SPARE = [
  { src: "assets/img/bloom-plaster-1.jpg",        w: 1114, h:  495, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "concept model, plaster and moss" },
  { src: "assets/img/bloom-plaster-2.jpg",        w: 1157, h:  535, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "sensory garden pillars" },
  { src: "assets/img/bloom-sketch-layer.jpg",     w:  296, h:  212, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "study: layer" },
  { src: "assets/img/bloom-sketch-indent.jpg",    w:  239, h:  309, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "study: indent" },
  { src: "assets/img/bloom-sketch-decay.jpg",     w:  309, h:  244, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "study: decay" },
  { src: "assets/img/bloom-sketch-floors.jpg",    w:  289, h:  309, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "sketch: layered floors" },
  { src: "assets/img/bloom-sketch-facade.jpg",    w:  211, h:  286, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "sketch: decayed facade" },
  { src: "assets/img/bloom-axon.jpg",             w:  543, h: 1089, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "study axonometrics" },
  { src: "assets/img/bloom-detail.jpg",           w: 1200, h:  718, kind: "draw",  project: "bloom on spring",   year: "2024",  title: "water collecting detail" },
  { src: "assets/img/harvest-column.jpg",         w:  678, h:  375, kind: "photo", project: "harvest hub",       year: "2024",  title: "column detail" },
  { src: "assets/img/harvest-concept.jpg",        w:  463, h: 1152, kind: "draw",  project: "harvest hub",       year: "2024",  title: "concept plans" },
  { src: "assets/img/harvest-axon.jpg",           w:  769, h: 1080, kind: "draw",  project: "harvest hub",       year: "2024",  title: "sketch of the mezzanine" },
  { src: "assets/img/harvest-diagram.jpg",        w:  377, h:  311, kind: "draw",  project: "harvest hub",       year: "2024",  title: "sketch: light and ventilation" },
  { src: "assets/img/nha-elevations.jpg",         w: 1200, h:  407, kind: "photo",  ground: "white", project: "nhà",               year: "2025",  title: "module elevations" },
  { src: "assets/img/knot-roofplan.jpg",          w:  681, h:  686, kind: "draw",  project: "knot",              year: "2025",  title: "roof plan" },
  { src: "assets/img/knot-section-a.jpg",         w: 1200, h:  354, kind: "draw",  project: "knot",              year: "2025",  title: "section a-a" },
];
