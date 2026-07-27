// A-class article disposition map.
// Geo-template spam — either redirect (301) to country pillar or noindex.
// Referenced by generate-sitemap.mjs, prerender.mjs, and _redirects generator.

export const A_CLASS = {
  // --- Egypt (4 → parking-ac-egypt) ---
  'parking-ac-egypt-alexandria-coastal-humidity': 'parking-ac-egypt',
  'parking-ac-egypt-cairo-delivery-vans':         'parking-ac-egypt',
  'parking-ac-egypt-desert-heat':                 'parking-ac-egypt',
  'parking-ac-egypt-luxor-tourism-vehicles':      'parking-ac-egypt',

  // --- Ghana (4 → parking-ac-ghana-commercial) ---
  'parking-ac-ghana-accra-urban-transport':   'parking-ac-ghana-commercial',
  'parking-ac-ghana-commercial-transport':    'parking-ac-ghana-commercial',
  'parking-ac-ghana-kumasi-industrial-zone':  'parking-ac-ghana-commercial',
  'parking-ac-ghana-tamale-northern-region':  'parking-ac-ghana-commercial',

  // --- Kenya (5 → parking-ac-kenya-guide) ---
  'parking-ac-kenya-nairobi-public-transport':     'parking-ac-kenya-guide',
  'parking-ac-kenya-mombasa-port':                 'parking-ac-kenya-guide',
  'parking-ac-kenya-logistics-fleet':              'parking-ac-kenya-guide',
  'parking-ac-kenya-eldoret-cold-chain':           'parking-ac-kenya-guide',
  'parking-ac-kenya-nakuru-agricultural-transport':'parking-ac-kenya-guide',

  // --- Nigeria (5 → parking-ac-nigeria-guide) ---
  'parking-ac-nigeria-kano-hot-climate':        'parking-ac-nigeria-guide',
  'parking-ac-nigeria-lagos-traffic-heat':      'parking-ac-nigeria-guide',
  'parking-ac-nigeria-truck-drivers-guide':     'parking-ac-nigeria-guide',
  'parking-ac-nigeria-ibadan-commercial-drivers':'parking-ac-nigeria-guide',
  'parking-ac-nigeria-port-harcourt-humidity':  'parking-ac-nigeria-guide',

  // --- South Africa (4 → noindex; no country pillar yet) ---
  'parking-ac-south-africa-cape-town-tourism':     null,
  'parking-ac-south-africa-freight-industry':      null,
  'parking-ac-south-africa-mining-vehicles':       null,
  'parking-ac-south-africa-johannesburg-commuter': null,

  // --- Tanzania (4 → parking-ac-tanzania-safari) ---
  'parking-ac-tanzania-arusha-wildlife-tours':   'parking-ac-tanzania-safari',
  'parking-ac-tanzania-dar-es-salaam-logistics': 'parking-ac-tanzania-safari',
  'parking-ac-tanzania-safari-tourism':          'parking-ac-tanzania-safari',
  'parking-ac-tanzania-zanzibar-tourism':        'parking-ac-tanzania-safari',

  // --- Ethiopia (2 → parking-ac-ethiopia) ---
  'parking-ac-ethiopia-agricultural-vehicles':  'parking-ac-ethiopia',
  'parking-ac-ethiopia-addis-ababa-altitude':   'parking-ac-ethiopia',

  // --- Morocco (2 → parking-ac-morocco) ---
  'parking-ac-morocco-cross-border-transport': 'parking-ac-morocco',
  'parking-ac-morocco-casablanca-freight':     'parking-ac-morocco',
};

export const A_CLASS_SLUGS = new Set(Object.keys(A_CLASS));
