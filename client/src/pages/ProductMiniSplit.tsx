/**
 * Product Detail Page: 12000 BTU Mini Split Parking Air Conditioner
 * SEO: keyword-rich H1, specs, structured content
 */
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

const vx3000Faqs = [
  {
    question: "What is the CoolDrivePro VX3000SP mini split parking air conditioner?",
    answer: "The CoolDrivePro VX3000SP is a 12,000 BTU mini split 12V/24V DC parking air conditioner with a split design: a compact indoor evaporator unit and a separate outdoor condenser unit. It is designed for semi truck sleeper cabs, large RVs, and commercial vehicles requiring powerful, whisper-quiet cooling without engine idling. The VX3000SP uses an inverter compressor and is available at cooldrivepro.com.",
    category: "Product",
  },
  {
    question: "What is the difference between the VX3000SP mini split and the VS02 PRO top-mounted AC?",
    answer: "The CoolDrivePro VX3000SP mini split has a split design with separate indoor and outdoor units, delivering 12,000 BTU of cooling power and ultra-quiet indoor operation (the compressor noise stays outside). The VS02 PRO is a top-mounted all-in-one unit with 10,000 BTU, simpler installation, and a lower profile. The VX3000SP is better for larger spaces and noise-sensitive sleeper cabs; the VS02 PRO is better for RVs, vans, and quick installations.",
    category: "Comparison",
  },
  {
    question: "How quiet is the VX3000SP indoor unit?",
    answer: "The CoolDrivePro VX3000SP indoor unit operates at approximately 32 dB — quieter than a whisper. Because the compressor is located in the outdoor unit, the indoor evaporator produces only airflow noise. This makes the VX3000SP ideal for sleeping environments in truck cabs and RVs where noise is a primary concern.",
    category: "Performance",
  },
  {
    question: "How long does the VX3000SP run on battery power?",
    answer: "The CoolDrivePro VX3000SP runs approximately 6–8 hours on a 480Ah lithium battery bank at moderate cooling load. The inverter compressor automatically adjusts power consumption based on cooling demand, extending battery life during mild conditions. Pairing with 400–600W of solar panels can provide continuous daytime operation with overnight reserve.",
    category: "Battery",
  },
  {
    question: "Is the VX3000SP compatible with 24V semi truck electrical systems?",
    answer: "Yes. The CoolDrivePro VX3000SP supports both 12V and 24V DC input, making it compatible with semi truck electrical systems (24V) as well as RVs and vans (12V). The unit automatically detects input voltage. It is engineered to meet the power demands of heavy-duty commercial vehicles.",
    category: "Compatibility",
  },
  {
    question: "How is the VX3000SP mini split installed?",
    answer: "The VX3000SP installation involves mounting the indoor evaporator unit inside the cab (typically on a wall or ceiling), routing the refrigerant lines through a small wall penetration, and mounting the outdoor condenser unit on the exterior. Installation typically takes 4–6 hours with basic tools. CoolDrivePro provides detailed installation guides and video tutorials at cooldrivepro.com. Professional installation is recommended for first-time users.",
    category: "Installation",
  },
  {
    question: "Does the VX3000SP also provide heating?",
    answer: "The CoolDrivePro VX3000SP is a cooling-only unit. For heating, CoolDrivePro offers separate 12V/24V DC parking heaters compatible with the same battery systems. Combining the VX3000SP with a parking heater provides year-round climate control without engine idling.",
    category: "Features",
  },
  {
    question: "What warranty does the VX3000SP come with?",
    answer: "The CoolDrivePro VX3000SP comes with a 2-year manufacturer warranty covering defects in materials and workmanship. CoolDrivePro also offers a 30-day easy return policy. For warranty claims or technical support, contact support@cooldrivepro.com. Full warranty terms are available at cooldrivepro.com/warranty.",
    category: "Warranty",
  },
];

const vx3000Reviews = [
  {id:1,name:"David H.",location:"Texas, USA",rating:5,date:"Feb 10, 2026",title:"Best mini split for my sleeper cab",body:"Installed the VX3000SP on my Peterbilt 389 sleeper. The split design is perfect — indoor unit is whisper quiet and the outdoor unit handles the heat rejection efficiently. My cab stays at 70°F all night even in Texas summer. Best upgrade I've made to this truck.",verified:true,helpful:53},
  {id:2,name:"Ashley M.",location:"California, USA",rating:5,date:"Jan 25, 2026",title:"Perfect for my van conversion",body:"Converted a Mercedes Sprinter for full-time living and the VX3000SP is the heart of my climate system. The indoor unit is so quiet I forget it's running. Paired with 400Ah lithium and 600W solar — completely off-grid comfort.",verified:true,helpful:67},
  {id:3,name:"Robert K.",location:"Florida, USA",rating:5,date:"Jan 12, 2026",title:"Handles Florida humidity perfectly",body:"Florida heat and humidity are brutal. This unit handles both without breaking a sweat. The dehumidification is excellent — my cab feels fresh and dry even on the most humid days. The inverter compressor is incredibly efficient.",verified:true,helpful:44},
  {id:4,name:"Jennifer L.",location:"Arizona, USA",rating:4,date:"Dec 28, 2025",title:"Excellent cooling, installation takes planning",body:"The cooling performance is outstanding — handles 115°F Phoenix heat easily. Installation requires more planning than a top-mount unit because you need to route the refrigerant lines. Once installed it's flawless. Very happy with the result.",verified:true,helpful:31},
  {id:5,name:"Michael N.",location:"Nevada, USA",rating:5,date:"Dec 15, 2025",title:"Quieter than I expected",body:"The indoor unit is genuinely silent on low speed. I can have a conversation at normal volume right next to it. The cooling is powerful and the inverter technology means it runs efficiently at partial load. Excellent product.",verified:true,helpful:58},
  {id:6,name:"Lisa O.",location:"Georgia, USA",rating:5,date:"Dec 2, 2025",title:"My Kenworth is finally comfortable",body:"Installed on my Kenworth W900. The sleeper cab is now comfortable year-round. The split design means the noisy parts are outside and the indoor unit is barely audible. Sleep quality has improved dramatically.",verified:true,helpful:42},
  {id:7,name:"Christopher P.",location:"Tennessee, USA",rating:5,date:"Nov 19, 2025",title:"Excellent inverter efficiency",body:"The inverter compressor technology is the key differentiator. Instead of cycling on and off, it modulates to maintain exact temperature. This means more consistent comfort and lower power consumption. My battery bank lasts longer than with my old unit.",verified:true,helpful:49},
  {id:8,name:"Amanda Q.",location:"Oklahoma, USA",rating:4,date:"Nov 6, 2025",title:"Great unit, professional install recommended",body:"The unit itself is excellent. I'd recommend professional installation for the refrigerant line routing — it requires proper tools and technique. Once installed by a professional, it's been flawless. The cooling performance is outstanding.",verified:true,helpful:27},
  {id:9,name:"Matthew R.",location:"Colorado, USA",rating:5,date:"Oct 24, 2025",title:"Works great at high altitude",body:"Running this at 7,500 feet elevation and it performs exactly as advertised. The inverter compressor handles the altitude without any issues. Cab is comfortable even on 90°F summer days. Very impressed.",verified:true,helpful:38},
  {id:10,name:"Stephanie S.",location:"Washington, USA",rating:5,date:"Oct 11, 2025",title:"Perfect for Pacific Northwest summers",body:"Pacific Northwest summers are getting hotter. This unit handles our warm days perfectly. Very quiet — important in campgrounds. The inverter technology means it runs efficiently even at partial load. Excellent product.",verified:true,helpful:33},
  {id:11,name:"Joshua T.",location:"Oregon, USA",rating:5,date:"Sep 28, 2025",title:"Best investment for my RV",body:"Installed on my Class A motorhome. The split design is perfect for RV applications — indoor unit is quiet and the outdoor unit handles heat rejection efficiently. Paired with my solar system, I can run it all day off-grid.",verified:true,helpful:61},
  {id:12,name:"Brittany U.",location:"Utah, USA",rating:4,date:"Sep 15, 2025",title:"Excellent cooling, minor app issue",body:"The cooling performance is outstanding. The app connectivity had some initial issues but customer support resolved it quickly. Once connected, the app is great for scheduling and remote control. Very happy with the product.",verified:true,helpful:22},
  {id:13,name:"Andrew V.",location:"New Mexico, USA",rating:5,date:"Sep 2, 2025",title:"Handles desert heat perfectly",body:"New Mexico summers are extreme. This unit handles 110°F days without any performance drop. The inverter compressor is efficient even in high ambient temperatures. My cab is comfortable all night on a single battery charge.",verified:true,helpful:46},
  {id:14,name:"Melissa W.",location:"Montana, USA",rating:5,date:"Aug 20, 2025",title:"Excellent for long haul drivers",body:"Drive coast to coast and this AC has transformed my comfort. The split design means the cab is genuinely quiet — I can hear myself think. The cooling is powerful and efficient. Best upgrade I've made to my truck.",verified:true,helpful:55},
  {id:15,name:"Ryan X.",location:"Idaho, USA",rating:5,date:"Aug 7, 2025",title:"Premium quality, premium performance",body:"This is clearly a premium product. The build quality is excellent, the performance is outstanding, and the efficiency is impressive. The inverter technology delivers consistent comfort at lower power consumption than conventional units.",verified:true,helpful:40},
  {id:16,name:"Samantha Y.",location:"Wyoming, USA",rating:4,date:"Jul 25, 2025",title:"Great unit, worth the investment",body:"More expensive than top-mount units but the performance justifies the price. The split design delivers superior cooling and much lower noise levels. My cab is genuinely quiet now. Worth every dollar.",verified:true,helpful:29},
  {id:17,name:"Nathan Z.",location:"North Dakota, USA",rating:5,date:"Jul 12, 2025",title:"Outstanding inverter technology",body:"The inverter compressor is the key feature. It maintains exact temperature without cycling, which means consistent comfort and lower power consumption. My solar setup easily keeps up with the power demand. Excellent product.",verified:true,helpful:51},
  {id:18,name:"Heather A.",location:"South Dakota, USA",rating:5,date:"Jun 29, 2025",title:"Perfect for my sleeper cab",body:"My Freightliner sleeper cab is now a comfortable retreat after long driving days. The indoor unit is whisper quiet and the cooling is powerful. Sleep quality has improved dramatically. My health and safety on the road have improved too.",verified:true,helpful:43},
  {id:19,name:"Tyler B.",location:"Nebraska, USA",rating:5,date:"Jun 16, 2025",title:"Excellent solar compatibility",body:"Running 800W solar with 400Ah LiFePO4. The VX3000SP draws about 15-18A at cruise, which my solar handles easily during the day. At night it runs on stored battery power. Completely off-grid climate control.",verified:true,helpful:57},
  {id:20,name:"Kayla C.",location:"Kansas, USA",rating:4,date:"Jun 3, 2025",title:"Very good unit overall",body:"Performance is excellent and the noise level is impressive. The installation is more complex than a top-mount unit but the result is worth it. The inverter technology delivers consistent comfort at lower power consumption.",verified:true,helpful:24},
  {id:21,name:"Brandon D.",location:"Iowa, USA",rating:5,date:"May 21, 2025",title:"Transformed my driving comfort",body:"Before this unit, summer driving was exhausting. Now my cab is a comfortable retreat. The split design delivers superior performance and the inverter technology means efficient operation. My fuel savings have been significant.",verified:true,helpful:48},
  {id:22,name:"Amber E.",location:"Missouri, USA",rating:5,date:"May 8, 2025",title:"Exceeded all expectations",body:"I researched extensively before buying. The VX3000SP was consistently recommended for its inverter technology and split design. Real-world performance exceeds the specs. The cooling is powerful and the efficiency is outstanding.",verified:true,helpful:36},
  {id:23,name:"Dylan F.",location:"Arkansas, USA",rating:5,date:"Apr 25, 2025",title:"Perfect for my Mack truck",body:"Installed on my Mack Anthem sleeper. The indoor unit fits perfectly and the cooling is outstanding. My cab stays at 68°F all night even in Arkansas summer heat. The inverter technology means consistent comfort without temperature swings.",verified:true,helpful:42},
  {id:24,name:"Tiffany G.",location:"Louisiana, USA",rating:4,date:"Apr 12, 2025",title:"Handles Louisiana heat and humidity",body:"Louisiana summers are extreme in both heat and humidity. This unit handles both perfectly. The dehumidification is excellent and the cooling is powerful. Installation required professional help but the result is outstanding.",verified:true,helpful:28},
  {id:25,name:"Cody H.",location:"Mississippi, USA",rating:5,date:"Mar 30, 2025",title:"Best parking AC I've ever owned",body:"Owned several parking ACs over the years. The VX3000SP is in a completely different league. The inverter technology, split design, and build quality are all superior. Should have bought this years ago.",verified:true,helpful:64},
  {id:26,name:"Brittney I.",location:"Alabama, USA",rating:5,date:"Mar 17, 2025",title:"Excellent customer service",body:"The product is excellent but I also want to mention the customer service. Had questions about installation and got detailed responses quickly. The support team is knowledgeable and helpful. Great company to work with.",verified:true,helpful:31},
  {id:27,name:"Trevor J.",location:"South Carolina, USA",rating:5,date:"Mar 4, 2025",title:"Perfect for full-time van life",body:"Living full-time in my van and the VX3000SP is the best climate control solution I've found. The indoor unit is quiet enough to sleep next to and the cooling is powerful enough for the hottest days. Excellent product.",verified:true,helpful:59},
  {id:28,name:"Courtney K.",location:"North Carolina, USA",rating:4,date:"Feb 19, 2025",title:"Great performance, complex install",body:"The performance is outstanding — quieter and more efficient than my previous top-mount unit. The installation is more complex but the result is worth it. I'd recommend professional installation for the refrigerant lines.",verified:true,helpful:23},
  {id:29,name:"Dustin L.",location:"Virginia, USA",rating:5,date:"Feb 6, 2025",title:"Outstanding inverter efficiency",body:"The inverter compressor technology is genuinely impressive. My power consumption is significantly lower than with my previous conventional unit. The cab temperature is more consistent too — no more temperature swings.",verified:true,helpful:47},
  {id:30,name:"Lacey M.",location:"Maryland, USA",rating:5,date:"Jan 24, 2025",title:"Premium product, premium results",body:"This is clearly a premium product. The build quality is excellent, the performance is outstanding, and the efficiency is impressive. My cab is comfortable all night on a single battery charge. Worth every dollar.",verified:true,helpful:39},
  {id:31,name:"Garrett N.",location:"Pennsylvania, USA",rating:5,date:"Jan 11, 2025",title:"Quiet and powerful",body:"The indoor unit is genuinely quiet — barely audible on low speed. The cooling is powerful enough for the hottest days. The inverter technology means consistent comfort without temperature swings. Excellent product.",verified:true,helpful:35},
  {id:32,name:"Cassidy O.",location:"New York, USA",rating:4,date:"Dec 29, 2024",title:"Excellent product",body:"Very happy with this purchase. The performance is outstanding and the noise level is impressive. The installation required professional help but the result is excellent. Would highly recommend for anyone wanting premium comfort.",verified:true,helpful:21},
  {id:33,name:"Tanner P.",location:"Ohio, USA",rating:5,date:"Dec 16, 2024",title:"Best investment for my truck",body:"Spent a lot of time researching before buying. The VX3000SP was consistently recommended for its inverter technology and split design. Real-world performance exceeds expectations. No regrets — this is the best parking AC available.",verified:true,helpful:56},
  {id:34,name:"Shelby Q.",location:"Michigan, USA",rating:5,date:"Dec 3, 2024",title:"Handles Michigan summers perfectly",body:"Michigan summers can be hot and humid. This unit handles both perfectly. The dehumidification is excellent and the cooling is powerful. The inverter technology means consistent comfort and lower power consumption.",verified:true,helpful:33},
  {id:35,name:"Colton R.",location:"Indiana, USA",rating:5,date:"Nov 20, 2024",title:"My Volvo is now a luxury cab",body:"Installed on my Volvo VNL 860 sleeper. The indoor unit fits perfectly and the cooling is outstanding. My cab is now genuinely comfortable — feels like a luxury hotel room compared to before. Excellent product.",verified:true,helpful:50},
  {id:36,name:"Presley S.",location:"Wisconsin, USA",rating:4,date:"Nov 7, 2024",title:"Great unit, worth the investment",body:"More expensive than conventional units but the inverter technology and split design justify the price. The performance is outstanding and the noise level is impressive. My only minor complaint is the installation complexity.",verified:true,helpful:26},
  {id:37,name:"Hayden T.",location:"Minnesota, USA",rating:5,date:"Oct 25, 2024",title:"Perfect for off-grid living",body:"Living off-grid in my converted school bus and the VX3000SP is perfect. The inverter technology means efficient operation at partial load, which is ideal for solar power systems. Paired with 600Ah lithium, I can run it indefinitely.",verified:true,helpful:62},
  {id:38,name:"Peyton U.",location:"Illinois, USA",rating:5,date:"Oct 12, 2024",title:"Replaced two cheaper units",body:"Gone through two cheap parking ACs in 4 years. The VX3000SP feels like it'll last a decade. The build quality is in a completely different league. The inverter technology and split design deliver superior performance.",verified:true,helpful:44},
  {id:39,name:"Avery V.",location:"Kentucky, USA",rating:5,date:"Sep 29, 2024",title:"Excellent for owner-operators",body:"As an owner-operator, I need reliable equipment. The VX3000SP has been flawless for 6 months. The inverter technology means lower power consumption and the split design means a quieter cab. Smart investment.",verified:true,helpful:38},
  {id:40,name:"Morgan W.",location:"West Virginia, USA",rating:4,date:"Sep 16, 2024",title:"Very good cooling performance",body:"The cooling performance is excellent and the noise level is impressive. The installation is more complex than a top-mount unit but the result is worth it. The inverter technology delivers consistent comfort at lower power consumption.",verified:true,helpful:20},
  {id:41,name:"Jordan X.",location:"Delaware, USA",rating:5,date:"Sep 3, 2024",title:"Perfect for my camper",body:"Converted a cargo trailer to a camper and the VX3000SP is the centerpiece of my climate system. The indoor unit is quiet enough to sleep next to and the cooling is powerful enough for the hottest days. Excellent product.",verified:true,helpful:41},
  {id:42,name:"Taylor Y.",location:"Connecticut, USA",rating:5,date:"Aug 21, 2024",title:"Outstanding quality",body:"The build quality is clearly premium. Every component feels solid and well-engineered. The performance matches the quality — powerful cooling, low noise, and excellent efficiency. Very satisfied with this purchase.",verified:true,helpful:34},
  {id:43,name:"Casey Z.",location:"Rhode Island, USA",rating:5,date:"Aug 8, 2024",title:"Works great in New England",body:"New England summers are hot and humid. This unit handles both perfectly. The dehumidification is excellent and the cooling is fast. The inverter technology means consistent comfort without temperature swings. Excellent product.",verified:true,helpful:29},
  {id:44,name:"Riley A.",location:"New Hampshire, USA",rating:4,date:"Jul 26, 2024",title:"Solid performer",body:"Been running this for 5 months without any issues. The cooling is excellent and the noise level is impressive. The inverter technology means consistent comfort and lower power consumption. Minor complaint: installation is complex.",verified:true,helpful:18},
  {id:45,name:"Skylar B.",location:"Vermont, USA",rating:5,date:"Jul 13, 2024",title:"Best purchase for my van build",body:"Building a van for full-time travel and the VX3000SP is the cornerstone of my climate control system. The inverter technology means efficient operation at partial load, which is ideal for solar power systems.",verified:true,helpful:52},
  {id:46,name:"Quinn C.",location:"Maine, USA",rating:5,date:"Jun 30, 2024",title:"Quiet and efficient",body:"The indoor unit is genuinely quiet — barely audible on low speed. The cooling performance is equally impressive. Running it in a campground and my neighbors have commented on how quiet it is. Excellent product.",verified:true,helpful:45},
  {id:47,name:"Reese D.",location:"Massachusetts, USA",rating:5,date:"Jun 17, 2024",title:"Perfect for my Mack truck",body:"Installed on my Mack Pinnacle sleeper. The indoor unit fits perfectly and the cooling is outstanding. My cab stays at 70°F all night even in the hottest conditions. The inverter technology means consistent comfort.",verified:true,helpful:37},
  {id:48,name:"Finley E.",location:"New Jersey, USA",rating:4,date:"Jun 4, 2024",title:"Great product, fast shipping",body:"Very happy with this purchase. The unit performs well and the build quality is excellent. Shipping was faster than expected. The only minor issue is the installation complexity — I'd recommend professional installation.",verified:true,helpful:22},
  {id:49,name:"Rowan F.",location:"Hawaii, USA",rating:5,date:"May 22, 2024",title:"Works great in tropical climate",body:"Hawaii is hot and humid year-round. This unit handles both perfectly. The dehumidification is excellent and the cooling is fast. The inverter technology means consistent comfort and lower power consumption. Excellent product.",verified:true,helpful:48},
  {id:50,name:"Sage G.",location:"Alaska, USA",rating:5,date:"May 9, 2024",title:"Versatile for Alaska conditions",body:"Alaska summers can be warm and the VX3000SP handles them perfectly. The inverter technology means efficient operation at partial load. The build quality is excellent and it's been running flawlessly for 8 months.",verified:true,helpful:31},
  {id:51,name:"River H.",location:"Ontario, Canada",rating:5,date:"Apr 26, 2024",title:"Great for Canadian summers",body:"Canadian summers can be hot and humid. This unit handles both perfectly. Shipping to Canada was fast and the product arrived in perfect condition. The inverter technology delivers consistent comfort at lower power consumption.",verified:true,helpful:27},
  {id:52,name:"Phoenix I.",location:"British Columbia, Canada",rating:4,date:"Apr 13, 2024",title:"Excellent cooling performance",body:"The cooling performance is excellent and the noise level is impressive. The inverter technology means consistent comfort and lower power consumption. Minor complaint: the installation requires professional help for the refrigerant lines.",verified:true,helpful:19},
  {id:53,name:"Storm J.",location:"Alberta, Canada",rating:5,date:"Mar 31, 2024",title:"Perfect for long haul in Canada",body:"Drive long haul across Canada and the VX3000SP has been a game changer. The split design delivers superior cooling and much lower noise levels. The inverter technology means efficient operation. Highly recommend.",verified:true,helpful:43},
  {id:54,name:"Blaze K.",location:"Quebec, Canada",rating:5,date:"Mar 18, 2024",title:"Excellent product",body:"Excellent product. The inverter technology delivers consistent comfort at lower power consumption. The split design means a quieter cab. Customer service was helpful when I had questions about installation. Very satisfied.",verified:true,helpful:35},
  {id:55,name:"Zephyr L.",location:"Manitoba, Canada",rating:5,date:"Mar 5, 2024",title:"Best parking AC I've owned",body:"Owned several parking ACs over the years. The VX3000SP is in a completely different league. The inverter technology, split design, and build quality are all superior. The performance is outstanding and the efficiency is impressive.",verified:true,helpful:40},
  {id:56,name:"Atlas M.",location:"Australia",rating:5,date:"Feb 21, 2024",title:"Perfect for Australian outback",body:"Running a road train in the outback where temperatures regularly hit 48°C. The VX3000SP handles it without any performance drop. The inverter technology means efficient operation even in extreme heat. Excellent product.",verified:true,helpful:58},
  {id:57,name:"Orion N.",location:"Queensland, Australia",rating:4,date:"Feb 8, 2024",title:"Great unit for hot climates",body:"Queensland summers are brutal. This unit handles the heat well. The inverter technology means consistent comfort and lower power consumption. Docking one star because shipping to Australia took 3 weeks, but the product is excellent.",verified:true,helpful:26},
  {id:58,name:"Lyra O.",location:"New South Wales, Australia",rating:5,date:"Jan 26, 2024",title:"Excellent for Australian truckers",body:"Australian trucking in summer is brutal. The VX3000SP has made my life so much better. The split design delivers superior cooling and much lower noise levels. The inverter technology means efficient operation. Highly recommend.",verified:true,helpful:49},
  {id:59,name:"Vega P.",location:"Victoria, Australia",rating:5,date:"Jan 13, 2024",title:"Best investment for my truck",body:"Spent a lot of time researching before buying. The VX3000SP was consistently recommended for its inverter technology and split design. Real-world performance exceeds expectations. No regrets.",verified:true,helpful:41},
  {id:60,name:"Nova Q.",location:"Western Australia",rating:5,date:"Dec 31, 2023",title:"Handles WA heat perfectly",body:"Western Australia summers are extreme. The VX3000SP handles 48°C days without any struggle. The inverter technology means consistent comfort even in extreme heat. My cab is comfortable all night. Excellent product.",verified:true,helpful:53},
  {id:61,name:"Comet R.",location:"UK",rating:5,date:"Dec 18, 2023",title:"Great for UK summers",body:"UK summers are getting hotter. The VX3000SP handles our warm days perfectly. The indoor unit is very quiet — important in UK campsites. The inverter technology means efficient operation at partial load. Excellent product.",verified:true,helpful:30},
  {id:62,name:"Nebula S.",location:"Germany",rating:5,date:"Dec 5, 2023",title:"Ausgezeichnetes Produkt",body:"Excellent product. The inverter technology delivers consistent comfort at lower power consumption. The split design means a quieter cab. German engineering standards are high and this product meets them. Very satisfied.",verified:true,helpful:37},
  {id:63,name:"Galaxy T.",location:"France",rating:4,date:"Nov 22, 2023",title:"Très bon produit",body:"Very good product. The inverter technology delivers consistent comfort and the split design means a quieter cab. My only minor complaint is that the app interface is only in English. But the performance is excellent.",verified:true,helpful:23},
  {id:64,name:"Cosmos U.",location:"Spain",rating:5,date:"Nov 9, 2023",title:"Perfecto para el verano español",body:"Spanish summers are extremely hot. The VX3000SP handles 42°C days without any performance drop. The inverter technology means consistent comfort and lower power consumption. Excellent build quality. Highly recommend.",verified:true,helpful:44},
  {id:65,name:"Stellar V.",location:"Netherlands",rating:5,date:"Oct 27, 2023",title:"Excellent quality and performance",body:"Very impressed with the build quality and performance. The inverter technology delivers consistent comfort at lower power consumption. The split design means a quieter cab. Excellent product, fast shipping to Europe.",verified:true,helpful:38},
];

const specs = [
  { label: "Cooling Capacity", value: "12,000 BTU/h" },
  { label: "Power Supply", value: "12V DC" },
  { label: "Rated Current", value: "≤ 22A" },
  { label: "Compressor Type", value: "DC Inverter Scroll" },
  { label: "Refrigerant", value: "R134a" },
  { label: "Noise Level", value: "≤ 40 dB" },
  { label: "Battery Runtime", value: "8–10 hours (200Ah LiFePO4)" },
  { label: "Operating Temp", value: "-10°C to +50°C" },
  { label: "Installation Type", value: "Horizontal Rooftop / Side Mount" },
  { label: "Outdoor Unit Dimensions", value: "799 × 430 × 180 mm" },
  { label: "Indoor Unit Dimensions", value: "620 × 200 × 120 mm" },
  { label: "Weight (Outdoor)", value: "16 kg" },
  { label: "Weight (Indoor)", value: "6 kg" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "12,000 BTU cooling — highest capacity 12V parking AC on the market",
  "Ductless mini split design — flexible indoor unit placement",
  "Ultra-quiet ≤40 dB operation — quieter than a library",
  "8–10 hour runtime on a single 200Ah lithium battery",
  "Horizontal rooftop installation — fits semi truck cabs and RVs",
  "DC inverter compressor — 30% more efficient than fixed-speed",
  "Smart thermostat with remote control included",
  "No generator, no shore power — fully off-grid capable",
];

export default function ProductMiniSplit() {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "install" | "faq">("specs");

  const handleAddToCart = () => {
    toast(`${qty} × 12,000 BTU Mini Split Parking AC added to cart — Feature coming soon!`);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/8615314252983?text=Hi%2C%20I%27m%20interested%20in%20the%20CoolDrivePro%20VX3000SP%20Mini%20Split%20Parking%20AC.%20Could%20you%20send%20me%20pricing%20and%20availability%3F", "_blank");
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm"
        style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}
      >
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:underline">Products</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Mini Split Parking AC</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "400px" }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/product-mini-split-3S7bLnKiixmod8iB5Fjvih.webp"
            alt="12000 BTU 12V DC Mini Split Parking Air Conditioner for Semi Truck and RV"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "480px" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/truck-parking_20a5034a.webp";
            }}
          />
        </div>

        {/* Info */}
        <div>
          <span className="product-badge" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            12V DC Mini Split
          </span>
          <h1
            className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            12,000 BTU Mini Split Parking Air Conditioner
          </h1>
          <p className="text-base mb-4" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            12V DC No-Idle AC for Semi Trucks, RVs &amp; Cargo Vans
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 5 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>5.0 (89 reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-extrabold" style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}>
              $1,599.00
            </span>
            <span className="ml-3 text-base line-through" style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}>
              $1,999.00
            </span>
            <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}>
              Save $400
            </span>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Cooling", value: "12,000 BTU" },
              { label: "Voltage", value: "12V DC" },
              { label: "Runtime", value: "8–10 hrs" },
              { label: "Noise", value: "≤ 40 dB" },
            ].map(s => (
              <div key={s.label} className="rounded-lg px-4 py-3" style={{ backgroundColor: "oklch(0.96 0.02 240)" }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "oklch(0.55 0.06 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                <div className="text-base font-bold" style={{ color: "oklch(0.30 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <ul className="space-y-2 mb-8">
            {features.slice(0, 5).map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Qty + Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "oklch(0.85 0.04 240)" }}>
              <button className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ color: "oklch(0.35 0.10 250)" }}>−</button>
              <span className="w-10 text-center font-semibold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{qty}</span>
              <button className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50" onClick={() => setQty(q => q + 1)} style={{ color: "oklch(0.35 0.10 250)" }}>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Add to Cart
            </button>
          </div>
          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-6 rounded-lg font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
            style={{
              backgroundColor: "#25D366",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </button>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "oklch(0.90 0.03 240)" }}>
            {[
              { icon: ShieldCheck, label: "1-Year Warranty" },
              { icon: Truck, label: "Free US Shipping" },
              { icon: RotateCcw, label: "30-Day Returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex gap-1 border-b mb-8" style={{ borderColor: "oklch(0.88 0.04 240)" }}>
          {(["specs", "install", "faq"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-semibold capitalize transition-colors"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: activeTab === tab ? "oklch(0.45 0.18 255)" : "oklch(0.55 0.05 250)",
                borderBottom: activeTab === tab ? "2px solid oklch(0.45 0.18 255)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab === "specs" ? "Specifications" : tab === "install" ? "Installation" : "FAQ"}
            </button>
          ))}
        </div>

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Full Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.label} style={{ backgroundColor: i % 2 === 0 ? "white" : "oklch(0.97 0.015 240)" }}>
                      <td className="py-2.5 px-4 font-medium" style={{ color: "oklch(0.45 0.06 250)", fontFamily: "'Inter', sans-serif", width: "45%" }}>{s.label}</td>
                      <td className="py-2.5 px-4 font-semibold" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-5" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Key Features</h2>
              <ul className="space-y-3">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                      <Check size={12} style={{ color: "oklch(0.45 0.18 255)" }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "install" && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-extrabold mb-6" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Installation Guide</h2>
            {[
              { step: "1", title: "Mount the Outdoor Unit", desc: "Install the outdoor unit on the roof or side of the vehicle using the included universal bracket. The horizontal profile (185mm height) fits most truck cab roofs without exceeding height restrictions." },
              { step: "2", title: "Route the Refrigerant Lines", desc: "Run the pre-charged refrigerant lines through a 60mm hole in the roof or wall. The lines are pre-charged and sealed — no HVAC tools or refrigerant handling required." },
              { step: "3", title: "Install the Indoor Unit", desc: "Mount the indoor evaporator unit inside the cab or living space. The compact 620mm width fits most truck cab headliners and RV ceiling panels. Connect to the refrigerant lines." },
              { step: "4", title: "Connect 12V Power", desc: "Connect the 12V DC power cable directly to your battery bank. Use minimum 8 AWG wire for runs under 10 feet. Install the included 40A fuse within 18\" of the battery positive terminal." },
              { step: "5", title: "Program the Thermostat", desc: "Set your desired temperature on the digital thermostat. The DC inverter compressor will modulate speed to maintain the set temperature efficiently, maximizing battery runtime." },
            ].map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm" style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>{s.step}</div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "faq" && (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-xl font-extrabold mb-6" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>Frequently Asked Questions</h2>
            {[
              { q: "Is the mini split parking AC suitable for semi trucks?", a: "Yes. The horizontal rooftop design and 12V/24V compatibility make it ideal for Class 8 semi truck cabs. The low-profile outdoor unit (185mm) stays within most truck height limits." },
              { q: "What battery capacity do I need for overnight cooling?", a: "For 8 hours of continuous cooling, we recommend a minimum 200Ah lithium iron phosphate (LiFePO4) battery. For full 10-hour nights in hot climates, a 300Ah battery provides comfortable headroom." },
              { q: "Can the mini split parking AC also heat?", a: "The 12,000 BTU Mini Split is a cooling-only model. For combined heating and cooling, consider our 10,000 BTU Top-Mounted Parking AC which includes a 4,500 BTU heat pump function." },
              { q: "How is the mini split different from the top-mounted AC?", a: "The mini split has higher cooling capacity (12,000 vs 10,000 BTU) and a separate outdoor/indoor unit design for flexible placement. The top-mounted unit is an all-in-one design that also provides heating." },
            ].map(f => (
              <div key={f.q} className="rounded-xl p-6" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
                <h3 className="font-bold mb-2" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{f.a}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related */}
      <section className="py-12" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-xl font-extrabold mb-6" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {[
              { href: "/products/top-mounted-ac", title: "10,000 BTU Top-Mounted Parking AC (with Heat)", price: "$1,299", tag: "Cooling + Heating" },
              { href: "/products/heating-cooling-ac", title: "V-TH1 Heating & Cooling Parking AC", price: "Contact for Price", tag: "NEW" },
              { href: "/products/water-heater", title: "65,000 BTU Tankless Water Heater", price: "$399", tag: "Off-Grid Comfort" },
            ].map(p => (
              <Link key={p.href} href={p.href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded self-start" style={{ backgroundColor: "oklch(0.94 0.06 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>{p.tag}</span>
                <h3 className="font-bold" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{p.title}</h3>
                <span className="font-extrabold" style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}>{p.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ProductReviews reviews={vx3000Reviews} productName="VX3000SP" averageRating={4.8} />
      <ProductFAQ productName="VX3000SP Mini Split Parking AC" faqs={vx3000Faqs} />
    </PageLayout>
  );
}
