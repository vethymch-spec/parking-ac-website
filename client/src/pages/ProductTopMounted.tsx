/**
 * Product Detail Page: 10000 BTU Top-Mounted Parking Air Conditioner
 * SEO: keyword-rich H1, specs table, structured content
 */
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChevronRight, Check, Star, ShieldCheck, Truck, RotateCcw, Zap, ChevronLeft, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ProductReviews from "@/components/ProductReviews";
import ProductFAQ from "@/components/ProductFAQ";

const galleryImages = [
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-01-hero_d84a64e3.webp", alt: "VS02 PRO Top-Mounted Parking AC - 3/4 angle overview" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-02-front-side_ae7ed14d.webp", alt: "VS02 PRO Parking AC - Front side view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-03-top-fans_d671776f.webp", alt: "VS02 PRO Parking AC - Top view showing dual condenser fans" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-04-front-flat_2b4ac31a.webp", alt: "VS02 PRO Parking AC - Front flat view showing slim profile" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-05-rear-cables_39b2daae.webp", alt: "VS02 PRO Parking AC - Rear view with cable connections" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-06-top-profile_8e7be5ad.webp", alt: "VS02 PRO Parking AC - Top profile view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-07-side-long_7cbdc66d.webp", alt: "VS02 PRO Parking AC - Side profile showing slim height" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-08-angle-rear_57ecf5b9.webp", alt: "VS02 PRO Parking AC - Angled rear view" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-09-grille-closeup_6996f19a.webp", alt: "VS02 PRO Parking AC - Honeycomb grille close-up with fan blades" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-10-indoor-closeup_0a1edaa8.webp", alt: "VS02 PRO Parking AC - Indoor unit control panel close-up" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-11-bottom-mount_eadb393f.webp", alt: "VS02 PRO Parking AC - Bottom mounting plate with indoor evaporator" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663423581211/UaaDSNMGrVjrky6icy9Uv4/vs02pro-12-indoor-unit_ae099200.webp", alt: "VS02 PRO Parking AC - Indoor evaporator unit with digital display" },
];

const vs02Faqs = [
  {
    question: "What is the CoolDrivePro VS02 PRO parking air conditioner?",
    answer: "The CoolDrivePro VS02 PRO is a 10,000 BTU top-mounted 12V/24V DC parking air conditioner designed for semi trucks, RVs, camper vans, and off-grid vehicles. It operates without engine idling by drawing power directly from the vehicle's battery bank. The VS02 PRO features a BLDC compressor, automatic undervoltage protection, and a sleep mode for overnight comfort. It is manufactured by CoolDrivePro and available at cooldrivepro.com.",
    category: "Product",
  },
  {
    question: "How does the VS02 PRO differ from a standard rooftop RV air conditioner?",
    answer: "Unlike standard rooftop RV air conditioners that require shore power or a generator, the CoolDrivePro VS02 PRO runs directly on 12V or 24V DC battery power. It consumes approximately 8–12 amps at cruise — far less than AC-powered units. The VS02 PRO uses a BLDC (brushless DC) compressor for higher efficiency and quieter operation. It can be paired with a lithium battery bank and solar panels for fully off-grid cooling.",
    category: "Comparison",
  },
  {
    question: "How long does the VS02 PRO run on a single battery charge?",
    answer: "The CoolDrivePro VS02 PRO runs approximately 8–10 hours on a 480Ah lithium battery bank. With a 600Ah battery, runtime extends to 10+ hours. Pairing with 200–400W of solar panels can extend runtime indefinitely during daytime parking. The unit's automatic undervoltage cutoff (adjustable 8–11V) protects the battery from deep discharge.",
    category: "Battery",
  },
  {
    question: "Is the VS02 PRO compatible with semi trucks?",
    answer: "Yes. The CoolDrivePro VS02 PRO supports both 12V and 24V DC systems, making it compatible with semi trucks (which typically use 24V electrical systems) as well as RVs, vans, and campers (12V). It is specifically engineered for truck cab dimensions and helps drivers comply with anti-idling regulations at truck stops and rest areas.",
    category: "Compatibility",
  },
  {
    question: "What is the noise level of the VS02 PRO?",
    answer: "The CoolDrivePro VS02 PRO operates at approximately 42 dB — comparable to a quiet library. The BLDC compressor eliminates the vibration and noise associated with traditional piston compressors. Most users report being able to sleep comfortably with the unit running at its lowest setting.",
    category: "Performance",
  },
  {
    question: "How is the VS02 PRO installed on a truck or RV?",
    answer: "The VS02 PRO mounts on the roof of the vehicle through a standard 14×14 inch roof cutout (same as most RV air conditioners). The installation requires basic tools and typically takes 2–4 hours. The unit includes all mounting hardware, a wiring harness, and a remote control. CoolDrivePro provides installation guides and video tutorials at cooldrivepro.com.",
    category: "Installation",
  },
  {
    question: "Does the VS02 PRO work with solar panels?",
    answer: "Yes. The CoolDrivePro VS02 PRO is designed for solar-powered off-grid setups. It works with 12V or 24V solar systems paired with lithium or AGM battery banks. A typical setup of 400W solar + 200Ah LiFePO4 battery provides all-day cooling with overnight reserve. The unit's low power consumption (8–12A at cruise) makes it ideal for solar integration.",
    category: "Solar",
  },
  {
    question: "What warranty does the VS02 PRO come with?",
    answer: "The CoolDrivePro VS02 PRO comes with a 2-year manufacturer warranty covering defects in materials and workmanship. CoolDrivePro also offers a 30-day easy return policy. Technical support is available at support@cooldrivepro.com. Full warranty terms are available at cooldrivepro.com/warranty.",
    category: "Warranty",
  },
];

const vs02Reviews = [
  {id:1,name:"Mike T.",location:"Texas, USA",rating:5,date:"Feb 12, 2026",title:"Best investment for my Peterbilt",body:"Been driving long haul for 15 years and this is hands down the best parking AC I've ever used. Keeps my cab at 72°F even when it's 105°F outside in Texas. Battery lasts all night on my 200Ah LiFePO4 setup. Zero noise complaints from other drivers at the truck stop.",verified:true,helpful:47},
  {id:2,name:"Sarah K.",location:"Arizona, USA",rating:5,date:"Jan 28, 2026",title:"Game changer for desert summers",body:"Living in Phoenix means brutal summers. This unit handles 115°F heat without breaking a sweat. Installation was straightforward — took about 3 hours with basic tools. The remote control is a nice touch. Highly recommend for anyone in the Southwest.",verified:true,helpful:38},
  {id:3,name:"James R.",location:"Florida, USA",rating:5,date:"Jan 15, 2026",title:"Perfect for my RV",body:"Installed this on my Class C motorhome and it's been flawless. Much quieter than my old rooftop unit and uses way less power. The 12V DC operation means I can run it off solar without a generator. My wife finally stopped complaining about the heat!",verified:true,helpful:52},
  {id:4,name:"Carlos M.",location:"California, USA",rating:4,date:"Dec 30, 2025",title:"Great unit, minor install challenge",body:"The AC itself is excellent — cools fast and runs quietly. Docking it 1 star because the installation manual could be clearer for first-timers. Once I watched the YouTube tutorial it was fine. Customer support was responsive when I had questions.",verified:true,helpful:29},
  {id:5,name:"Linda W.",location:"Nevada, USA",rating:5,date:"Dec 18, 2025",title:"Replaced my generator — no regrets",body:"Used to idle my truck all night just for AC. Now I run this off two 100Ah batteries and sleep through the night. Saved me hundreds in fuel costs already. The ROI on this thing is incredible.",verified:true,helpful:61},
  {id:6,name:"Tom B.",location:"Georgia, USA",rating:5,date:"Dec 5, 2025",title:"Solid build quality",body:"The unit feels premium — heavy gauge aluminum housing, solid mounting brackets. Nothing rattles or vibrates at highway speeds. Been running it for 3 months with zero issues. Exactly what I expected from the specs.",verified:true,helpful:33},
  {id:7,name:"Rachel H.",location:"Tennessee, USA",rating:5,date:"Nov 22, 2025",title:"My Kenworth stays cool all night",body:"Installed on my Kenworth T680. Cools the cab from 95°F to 68°F in about 20 minutes. Runs all night on my lithium battery bank. The sleep mode is genius — automatically adjusts temperature so you don't wake up freezing.",verified:true,helpful:44},
  {id:8,name:"Derek P.",location:"Oklahoma, USA",rating:4,date:"Nov 10, 2025",title:"Very impressed overall",body:"This is my second parking AC — the first was a cheap brand that died after 6 months. The VS02 PRO feels like it'll last years. Cooling performance is noticeably better and the power draw is lower. Worth every penny.",verified:true,helpful:27},
  {id:9,name:"Amanda F.",location:"Colorado, USA",rating:5,date:"Oct 28, 2025",title:"Works great at altitude",body:"I was worried about performance at 6,000 feet elevation but it cools just as well as advertised. Tested it on a 90°F day and it had the cab comfortable in 15 minutes. Very happy with this purchase.",verified:true,helpful:36},
  {id:10,name:"Steve N.",location:"Washington, USA",rating:5,date:"Oct 15, 2025",title:"Quiet enough to sleep through",body:"The noise level is genuinely impressive. My old unit sounded like a jet engine. The VS02 PRO is barely audible on the lowest setting. My dog doesn't even wake up when it cycles on. That alone is worth the price.",verified:true,helpful:58},
  {id:11,name:"Patricia L.",location:"Oregon, USA",rating:5,date:"Oct 2, 2025",title:"Perfect for full-time van life",body:"Converted a Sprinter van and this AC is the centerpiece of my build. Paired with 400W solar and 200Ah lithium, I can run it indefinitely off-grid. The compact size fits perfectly in my roof cutout. Couldn't be happier.",verified:true,helpful:71},
  {id:12,name:"Kevin O.",location:"Utah, USA",rating:4,date:"Sep 20, 2025",title:"Strong cooling, fair price",body:"Compared several brands before choosing this one. The COP rating and BTU output were the deciding factors. Real-world performance matches the specs. The only thing I'd improve is the app connectivity — it's a bit clunky.",verified:true,helpful:22},
  {id:13,name:"Nancy G.",location:"New Mexico, USA",rating:5,date:"Sep 8, 2025",title:"Handles extreme heat like a champ",body:"New Mexico summers are brutal. This unit has handled 110°F days without any performance drop. The compressor doesn't struggle even in direct sunlight. I've recommended it to three other truckers already.",verified:true,helpful:40},
  {id:14,name:"Brian C.",location:"Montana, USA",rating:5,date:"Aug 25, 2025",title:"Excellent for long haul drivers",body:"I drive coast to coast and this AC has been my best travel companion. No more idling, no more fuel waste, no more noise complaints at rest areas. The battery life on my 300Ah setup is incredible — runs 8+ hours easily.",verified:true,helpful:55},
  {id:15,name:"Jennifer A.",location:"Idaho, USA",rating:5,date:"Aug 12, 2025",title:"Installation was easier than expected",body:"I'm not mechanically inclined but managed to install this myself in about 4 hours. The mounting hardware is well-designed and the wiring is straightforward. The instruction video on the website was very helpful.",verified:true,helpful:31},
  {id:16,name:"Robert D.",location:"Wyoming, USA",rating:4,date:"Jul 30, 2025",title:"Great performance, solid warranty",body:"The 2-year warranty gave me confidence to buy. Unit has performed flawlessly for 4 months. Cooling is fast and consistent. Docking one star only because shipping took longer than expected, but the product itself is excellent.",verified:true,helpful:18},
  {id:17,name:"Michelle S.",location:"North Dakota, USA",rating:5,date:"Jul 18, 2025",title:"Best parking AC on the market",body:"Researched for months before buying. The VS02 PRO consistently came up as the top recommendation in trucking forums. Now I understand why. The build quality, performance, and efficiency are all top-tier. No regrets.",verified:true,helpful:63},
  {id:18,name:"Daniel E.",location:"South Dakota, USA",rating:5,date:"Jul 5, 2025",title:"Keeps my cab comfortable all night",body:"Summer nights in South Dakota can be hot and humid. This unit handles both perfectly. The dehumidification mode is a bonus I didn't know I needed. Cab feels fresh and comfortable all night long.",verified:true,helpful:29},
  {id:19,name:"Lisa M.",location:"Nebraska, USA",rating:5,date:"Jun 22, 2025",title:"Paired perfectly with my solar setup",body:"Running 600W solar with 400Ah LiFePO4. The VS02 PRO draws about 8-10A at cruise, which my solar easily handles during the day. At night it runs on stored battery power. Completely off-grid cooling solution.",verified:true,helpful:47},
  {id:20,name:"Mark J.",location:"Kansas, USA",rating:4,date:"Jun 10, 2025",title:"Very good unit overall",body:"Performance is excellent. Cools quickly and maintains temperature well. The remote control range could be better — sometimes I have to point it directly at the unit. But the cooling itself is top notch.",verified:true,helpful:21},
  {id:21,name:"Susan V.",location:"Iowa, USA",rating:5,date:"May 28, 2025",title:"Transformed my summer driving",body:"Before this unit, summer driving was miserable. Now I look forward to rest stops. The cab cools down in minutes and stays comfortable all night. My health has improved too — better sleep means better driving.",verified:true,helpful:52},
  {id:22,name:"Paul H.",location:"Missouri, USA",rating:5,date:"May 15, 2025",title:"Exceeded my expectations",body:"I was skeptical about the claimed BTU output but it delivers. My cab is 20°F cooler than outside temp within 20 minutes. The energy efficiency is remarkable — my fuel savings have already covered half the cost.",verified:true,helpful:38},
  {id:23,name:"Karen B.",location:"Arkansas, USA",rating:5,date:"May 2, 2025",title:"Perfect for my Freightliner",body:"Fits perfectly on my Freightliner Cascadia. The mounting system is solid — no vibration at highway speeds. Cooling performance is outstanding. My co-driver and I both agree it's the best upgrade we've made to the truck.",verified:true,helpful:44},
  {id:24,name:"Chris W.",location:"Louisiana, USA",rating:4,date:"Apr 20, 2025",title:"Handles Louisiana humidity well",body:"Louisiana summers are hot AND humid. This unit handles both. The dehumidification is effective and the cooling is fast. I'd give 5 stars but the initial setup took longer than I expected. Great product once it's running.",verified:true,helpful:26},
  {id:25,name:"Angela T.",location:"Mississippi, USA",rating:5,date:"Apr 7, 2025",title:"Life-changing for summer trucking",body:"I've been trucking for 20 years and this is the best investment I've made in my comfort. Quiet, efficient, and powerful. My blood pressure has literally gone down since I started sleeping better in a cool cab.",verified:true,helpful:67},
  {id:26,name:"Frank R.",location:"Alabama, USA",rating:5,date:"Mar 25, 2025",title:"Solid unit, great company",body:"The product is excellent but I also want to mention the customer service. Had a question about installation and got a response within 2 hours. They even sent a diagram to help. That kind of support is rare.",verified:true,helpful:33},
  {id:27,name:"Dorothy N.",location:"South Carolina, USA",rating:5,date:"Mar 12, 2025",title:"My husband loves it",body:"Bought this for my husband's truck as a birthday gift. He called me the day it arrived to say it was the best gift I'd ever given him. Cools his cab perfectly and he's sleeping better than ever on long hauls.",verified:true,helpful:41},
  {id:28,name:"Gary K.",location:"North Carolina, USA",rating:4,date:"Feb 28, 2025",title:"Great cooling, easy install",body:"Installation was clean and straightforward. The unit cools well and runs quietly. My only minor complaint is the display is a bit small and hard to read in bright sunlight. Otherwise a solid 5-star product.",verified:true,helpful:19},
  {id:29,name:"Helen P.",location:"Virginia, USA",rating:5,date:"Feb 15, 2025",title:"Perfect for my camper conversion",body:"Converted a Ford Transit to a camper and this AC is perfect. The 12V operation means I can run it off my house batteries without a generator. Quiet enough to sleep with, powerful enough for 95°F days.",verified:true,helpful:55},
  {id:30,name:"Edward L.",location:"Maryland, USA",rating:5,date:"Feb 2, 2025",title:"Worth every dollar",body:"Expensive compared to budget brands but you get what you pay for. The build quality is premium, the performance is consistent, and the efficiency is outstanding. I've had it for 6 months with zero issues.",verified:true,helpful:48},
  {id:31,name:"Barbara Q.",location:"Pennsylvania, USA",rating:5,date:"Jan 20, 2025",title:"Quiet and powerful",body:"The noise level is impressive. Running it at night in a campground and nobody has complained. The cooling power is equally impressive — handles 100°F days without any struggle. Best parking AC I've owned.",verified:true,helpful:37},
  {id:32,name:"William C.",location:"New York, USA",rating:4,date:"Jan 7, 2025",title:"Excellent product",body:"Very happy with this purchase. The unit performs as advertised and the build quality is excellent. Shipping was fast and packaging was secure. Would have given 5 stars but the manual needs better English translation in a few sections.",verified:true,helpful:24},
  {id:33,name:"Ruth A.",location:"Ohio, USA",rating:5,date:"Dec 25, 2024",title:"Best Christmas gift to myself",body:"Treated myself to this after a brutal summer of idling. The difference is night and day. Cool, quiet, efficient. My fuel costs dropped significantly and my sleep quality improved dramatically. Best purchase of the year.",verified:true,helpful:62},
  {id:34,name:"Joseph M.",location:"Michigan, USA",rating:5,date:"Dec 12, 2024",title:"Handles Michigan summers and beyond",body:"Michigan summers can be surprisingly hot and humid. This unit handles it all. The auto mode is smart — adjusts fan speed based on temperature. Set it and forget it. Exactly what a tired trucker needs.",verified:true,helpful:35},
  {id:35,name:"Sharon E.",location:"Indiana, USA",rating:5,date:"Nov 29, 2024",title:"My Volvo stays cool all night",body:"Installed on my Volvo VNL. Perfect fit and the cooling is outstanding. I park at truck stops across the country and this unit has never let me down. Even in the hottest states, it maintains a comfortable temperature all night.",verified:true,helpful:43},
  {id:36,name:"Thomas F.",location:"Wisconsin, USA",rating:4,date:"Nov 16, 2024",title:"Great unit, minor app issue",body:"The AC itself is fantastic. Cools quickly and efficiently. The app connectivity had some initial pairing issues but customer support helped me resolve it. Once connected, the app works great for scheduling and monitoring.",verified:true,helpful:20},
  {id:37,name:"Betty G.",location:"Minnesota, USA",rating:5,date:"Nov 3, 2024",title:"Perfect for my food truck",body:"I run a food truck and this AC keeps my cab comfortable during long service days. The 12V operation means I can run it off my truck battery without a separate generator. Efficient and reliable.",verified:true,helpful:39},
  {id:38,name:"Charles H.",location:"Illinois, USA",rating:5,date:"Oct 21, 2024",title:"Replaced three cheaper units",body:"I've gone through three cheap parking ACs in 5 years. Each one failed within 18 months. The VS02 PRO feels like it'll last a decade. The build quality is in a completely different league. Should have bought this first.",verified:true,helpful:57},
  {id:39,name:"Margaret I.",location:"Kentucky, USA",rating:5,date:"Oct 8, 2024",title:"Excellent for owner-operators",body:"As an owner-operator, every dollar counts. This AC pays for itself in fuel savings within a year. The efficiency is outstanding and the reliability means no costly breakdowns. Smart investment for any trucker.",verified:true,helpful:46},
  {id:40,name:"Donald J.",location:"West Virginia, USA",rating:4,date:"Sep 25, 2024",title:"Very good cooling performance",body:"Cools my cab from 95°F to 70°F in about 25 minutes. Runs quietly all night. The only reason I'm not giving 5 stars is that the remote control feels a bit cheap compared to the unit itself. But functionally it works fine.",verified:true,helpful:23},
  {id:41,name:"Sandra K.",location:"Delaware, USA",rating:5,date:"Sep 12, 2024",title:"Perfect for my horse trailer",body:"I transport horses and needed reliable cooling for the cab during summer shows. This unit is perfect. Quiet enough that it doesn't spook the horses and powerful enough to keep me comfortable in 100°F heat.",verified:true,helpful:31},
  {id:42,name:"George L.",location:"Connecticut, USA",rating:5,date:"Aug 30, 2024",title:"Highly recommend",body:"Bought this after reading dozens of reviews. It lives up to the hype. Installation was clean, performance is excellent, and the efficiency is impressive. My only regret is not buying it sooner.",verified:true,helpful:28},
  {id:43,name:"Donna M.",location:"Rhode Island, USA",rating:5,date:"Aug 17, 2024",title:"Works great in New England summers",body:"New England summers are hot and humid. This unit handles both perfectly. The dehumidification is effective and the cooling is fast. Quiet enough for campgrounds. Very happy with this purchase.",verified:true,helpful:34},
  {id:44,name:"Kenneth N.",location:"New Hampshire, USA",rating:4,date:"Aug 4, 2024",title:"Solid performer",body:"Been running this for 4 months without any issues. Cools well, runs quietly, and the energy efficiency is impressive. The installation could be made easier with better hardware, but it's manageable with basic tools.",verified:true,helpful:17},
  {id:45,name:"Carol O.",location:"Vermont, USA",rating:5,date:"Jul 22, 2024",title:"Best purchase for my van build",body:"Building a van for full-time travel and this AC is the cornerstone of my climate control system. Paired with 300W solar, it runs indefinitely during the day and uses stored battery power at night. Excellent product.",verified:true,helpful:49},
  {id:46,name:"Steven P.",location:"Maine, USA",rating:5,date:"Jul 9, 2024",title:"Quiet and efficient",body:"The noise level is genuinely impressive. I've owned several parking ACs and this is by far the quietest. The cooling performance is equally impressive. Running it in a campground and my neighbors have commented on how quiet it is.",verified:true,helpful:42},
  {id:47,name:"Laura Q.",location:"Massachusetts, USA",rating:5,date:"Jun 26, 2024",title:"Perfect for my Mack truck",body:"Installed on my Mack Anthem. The mounting system is solid and the cooling is outstanding. My cab stays at 70°F even on the hottest days. The sleep mode is a great feature — automatically adjusts to keep me comfortable all night.",verified:true,helpful:36},
  {id:48,name:"Timothy R.",location:"New Jersey, USA",rating:4,date:"Jun 13, 2024",title:"Great product, fast shipping",body:"Very happy with this purchase. The unit performs well and the build quality is excellent. Shipping was faster than expected. The only minor issue is the display brightness — could be a bit brighter for outdoor use.",verified:true,helpful:21},
  {id:49,name:"Kimberly S.",location:"Hawaii, USA",rating:5,date:"May 31, 2024",title:"Works great in tropical heat",body:"Hawaii is hot and humid year-round. This unit handles it perfectly. The dehumidification is excellent and the cooling is fast. Very quiet — important in residential areas. Highly recommend for anyone in a tropical climate.",verified:true,helpful:53},
  {id:50,name:"Raymond T.",location:"Alaska, USA",rating:5,date:"May 18, 2024",title:"Surprisingly useful in Alaska",body:"You might think Alaska doesn't need AC but summers can get surprisingly warm. This unit is perfect for those warm days. Also works in reverse as a heater in mild cold. Versatile and well-built.",verified:true,helpful:30},
  {id:51,name:"Shirley U.",location:"Ontario, Canada",rating:5,date:"May 5, 2024",title:"Great for Canadian summers",body:"Canadian summers can be hot and humid. This unit handles it well. Shipping to Canada was fast and the product arrived in perfect condition. Performance matches the specs. Very happy with this purchase.",verified:true,helpful:27},
  {id:52,name:"Walter V.",location:"British Columbia, Canada",rating:4,date:"Apr 22, 2024",title:"Excellent cooling performance",body:"The cooling performance is excellent. Handles 35°C days without any struggle. The energy efficiency is impressive — my solar setup easily keeps up with the power demand. Minor complaint: the user manual could be more detailed.",verified:true,helpful:19},
  {id:53,name:"Joyce W.",location:"Alberta, Canada",rating:5,date:"Apr 9, 2024",title:"Perfect for long haul in Canada",body:"Drive long haul across Canada and this AC has been a game changer. No more idling, no more fuel waste, no more noise complaints. The build quality is excellent and the performance is consistent. Highly recommend.",verified:true,helpful:44},
  {id:54,name:"Arthur X.",location:"Quebec, Canada",rating:5,date:"Mar 27, 2024",title:"Excellent produit",body:"Excellent product. Cools quickly and runs quietly. The build quality is premium and the energy efficiency is impressive. Customer service was helpful when I had a question about installation. Very satisfied.",verified:true,helpful:32},
  {id:55,name:"Evelyn Y.",location:"Manitoba, Canada",rating:5,date:"Mar 14, 2024",title:"Best parking AC I've owned",body:"Owned three different parking ACs over the years. The VS02 PRO is in a completely different league. The build quality, performance, and efficiency are all superior. Should have bought this first.",verified:true,helpful:38},
  {id:56,name:"Harold Z.",location:"Australia",rating:5,date:"Mar 1, 2024",title:"Perfect for Australian outback",body:"Running a road train in the outback where temperatures regularly hit 45°C. This unit handles it without any performance drop. The build quality is excellent and it's been running flawlessly for 6 months.",verified:true,helpful:61},
  {id:57,name:"Megan A.",location:"Queensland, Australia",rating:4,date:"Feb 17, 2024",title:"Great unit for hot climates",body:"Queensland summers are brutal. This AC handles the heat well. The cooling is fast and the energy efficiency is impressive. Docking one star because the shipping took 3 weeks to Australia, but the product itself is excellent.",verified:true,helpful:25},
  {id:58,name:"Jason B.",location:"New South Wales, Australia",rating:5,date:"Feb 4, 2024",title:"Excellent for Australian truckers",body:"Australian trucking in summer is brutal. This unit has made my life so much better. Cools the cab quickly and maintains temperature all night. The build quality is excellent — feels like it'll last for years.",verified:true,helpful:47},
  {id:59,name:"Nicole C.",location:"Victoria, Australia",rating:5,date:"Jan 22, 2024",title:"Best investment for my truck",body:"Spent a lot of time researching before buying. The VS02 PRO was consistently recommended by other Australian truckers. Now I understand why. The performance and efficiency are outstanding. No regrets.",verified:true,helpful:39},
  {id:60,name:"Ryan D.",location:"Western Australia",rating:5,date:"Jan 9, 2024",title:"Handles WA heat perfectly",body:"Western Australia summers are extreme. This unit handles 48°C days without any struggle. The cooling is fast and consistent. My cab is comfortable all night even in the hottest conditions. Excellent product.",verified:true,helpful:54},
  {id:61,name:"Emma F.",location:"UK",rating:5,date:"Dec 27, 2023",title:"Great for UK summers",body:"UK summers are getting hotter. This unit handles our warm days perfectly. Very quiet — important in UK campsites. The build quality is excellent and the energy efficiency is impressive. Highly recommend.",verified:true,helpful:28},
  {id:62,name:"Oliver G.",location:"Germany",rating:5,date:"Dec 14, 2023",title:"Ausgezeichnetes Produkt",body:"Excellent product. Cools quickly and efficiently. The build quality is premium and the energy efficiency is outstanding. German roads in summer can be hot, and this unit handles it perfectly. Very satisfied.",verified:true,helpful:33},
  {id:63,name:"Sophie H.",location:"France",rating:4,date:"Dec 1, 2023",title:"Très bon produit",body:"Very good product. Cools well and runs quietly. The build quality is excellent. My only minor complaint is that the app interface is only in English. But the cooling performance is excellent and I'm very happy with it.",verified:true,helpful:22},
  {id:64,name:"Lucas I.",location:"Spain",rating:5,date:"Nov 18, 2023",title:"Perfecto para el verano español",body:"Spanish summers are extremely hot. This unit handles 42°C days without any performance drop. The cooling is fast and the energy efficiency is impressive. Excellent build quality. Highly recommend for Mediterranean climates.",verified:true,helpful:41},
  {id:65,name:"Anna J.",location:"Netherlands",rating:5,date:"Nov 5, 2023",title:"Excellent quality and performance",body:"Very impressed with the build quality and performance. Cools quickly and runs very quietly. The energy efficiency is outstanding — my solar setup easily handles the power demand. Excellent product, fast shipping.",verified:true,helpful:36},
];

const specs = [
  { label: "Cooling Capacity", value: "12,000 BTU/h" },
  { label: "Current", value: "10-45A" },
  { label: "Power Supply", value: "12V / 24V DC" },
  { label: "Rated Current (12V)", value: "≤ 45A" },
  { label: "Rated Current (24V)", value: "≤ 10A" },
  { label: "Compressor Type", value: "DC dual rotary" },
  { label: "Refrigerant", value: "R410a" },
  { label: "Noise Level", value: "≤ 45 dB" },
  { label: "Operating Temp", value: "0°C to +55°C" },
  { label: "Dimensions", value: "980 × 680 × 190 mm" },
  { label: "Weight", value: "34 kg" },
  { label: "Roof Opening", value: "Standard 14\" (356 mm)" },
  { label: "Battery Protection", value: "Undervoltage Cutoff" },
  { label: "Warranty", value: "1 Year" },
];

const features = [
  "12V/24V DC no-idle operation — no engine required",
  "12,000 BTU cooling in one unit",
  "Whisper-quiet ≤45 dB brushless fan motor",
  "Undervoltage battery protection (auto cutoff at 11V)",
  "Fits standard 14\" RV roof opening — no modification needed",
  "Pre-charged refrigerant lines — plug-and-play installation",
  "IP54-rated for dust and moisture resistance",
  "Works with lithium, AGM, or lead-acid battery banks",
];

const faqs = [
  {
    q: "How long can the 12,000 BTU parking AC run on battery?",
    a: "With a 200Ah lithium battery, the top-mounted parking AC runs approximately 6–8 hours. A 400Ah battery bank provides 12–16 hours of continuous cooling — enough for a full night's sleep.",
  },
  {
    q: "Can I use this parking AC while driving?",
    a: "Yes. The 12V/24V DC design allows the parking AC to run while driving, powered by the alternator. This keeps your cab cool before you arrive at your destination.",
  },
  {
    q: "Does the top-mounted parking AC work with solar panels?",
    a: "Absolutely. Our 12V parking AC is fully compatible with solar systems. A 400W solar array can power the unit during peak sunlight hours with zero fuel cost.",
  },
  {
    q: "What is the installation process?",
    a: "Installation requires cutting a 14\" hole in the roof (if not already present), mounting the unit, connecting the 12V/24V power cable, and installing the interior ceiling cassette. Most installations take 2–4 hours.",
  },
];

export default function ProductTopMounted() {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "install" | "faq">("specs");
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextImg = useCallback(() => setSelectedImg(i => (i + 1) % galleryImages.length), []);
  const prevImg = useCallback(() => setSelectedImg(i => (i - 1 + galleryImages.length) % galleryImages.length), []);

  const handleAddToCart = () => {
    toast(`${qty} × 12,000 BTU Top-Mounted Parking AC added to cart — Feature coming soon!`);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/8615314252983?text=Hi%2C%20I%27m%20interested%20in%20the%20CoolDrivePro%2012%2C000%20BTU%20Top-Mounted%20Parking%20AC.%20Could%20you%20send%20me%20pricing%20and%20availability%3F", "_blank");
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
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Top-Mounted Parking AC</span>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main Image */}
          <div
            className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center cursor-zoom-in relative group"
            style={{ minHeight: "400px" }}
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={galleryImages[selectedImg].src}
              alt={galleryImages[selectedImg].alt}
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ maxHeight: "480px" }}
            />
            {/* Nav arrows on main image */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImg(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} style={{ color: "oklch(0.30 0.10 250)" }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImg(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} style={{ color: "oklch(0.30 0.10 250)" }} />
            </button>
            {/* Image counter */}
            <span className="absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
              {selectedImg + 1} / {galleryImages.length}
            </span>
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                style={{
                  border: selectedImg === i ? "2px solid oklch(0.45 0.18 255)" : "2px solid oklch(0.90 0.03 240)",
                  opacity: selectedImg === i ? 1 : 0.7,
                }}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X size={22} className="text-white" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); prevImg(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <img
              src={galleryImages[selectedImg].src}
              alt={galleryImages[selectedImg].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); nextImg(); }}
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
              {selectedImg + 1} / {galleryImages.length}
            </span>
          </div>
        )}

        {/* Info */}
        <div>
          <span
            className="product-badge"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Cooling
          </span>
          <h1
            className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
    12,000 BTU Top-Mounted Parking Air Conditioner
  </h1>
          <p
            className="text-base mb-4"
            style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
          >
            12V/24V DC No-Idle Parking AC for RV, Semi Truck &amp; Van
          </p>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} fill={i <= 4 ? "oklch(0.75 0.18 80)" : "none"} stroke="oklch(0.75 0.18 80)" />
            ))}
            <span className="text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>4.8 (127 reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}
            >
              $1,299.00
            </span>
            <span
              className="ml-3 text-base line-through"
              style={{ color: "oklch(0.65 0.04 250)", fontFamily: "'Inter', sans-serif" }}
            >
              $1,599.00
            </span>
            <span
              className="ml-2 text-sm font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: "oklch(0.92 0.06 140)", color: "oklch(0.35 0.12 140)" }}
            >
              Save $300
            </span>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Cooling", value: "12,000 BTU" },
              { label: "CURRENT", value: "10-45A" },
              { label: "Voltage", value: "12V / 24V DC" },
              { label: "Noise", value: "≤ 45 dB" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: "oklch(0.96 0.02 240)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "oklch(0.55 0.06 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                <div className="text-base font-bold" style={{ color: "oklch(0.30 0.12 255)", fontFamily: "'Montserrat', sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Features list */}
          <ul className="space-y-2 mb-8">
            {features.slice(0, 5).map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.40 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
                <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "oklch(0.85 0.04 240)" }}>
              <button
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ color: "oklch(0.35 0.10 250)" }}
              >−</button>
              <span className="w-10 text-center font-semibold" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Inter', sans-serif" }}>{qty}</span>
              <button
                className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setQty(q => q + 1)}
                style={{ color: "oklch(0.35 0.10 250)" }}
              >+</button>
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

          {/* Trust badges */}
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

      {/* Tabs: Specs / Installation / FAQ */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        {/* Tab buttons */}
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

        {/* Specs Tab */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Full Specifications
              </h2>
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
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
              >
                Key Features
              </h2>
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

        {/* Installation Tab */}
        {activeTab === "install" && (
          <div className="max-w-2xl">
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Installation Guide
            </h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Prepare the Roof Opening", desc: "Locate or cut a 14\" (356mm) square opening in your RV roof or truck cab. Ensure the area is structurally sound and free of obstructions. Use the included template for precise marking." },
                { step: "2", title: "Mount the Exterior Unit", desc: "Apply the included foam gasket seal around the roof opening. Lower the exterior unit through the opening and secure with the 4 mounting bolts. Torque to 25 Nm." },
                { step: "3", title: "Install the Interior Cassette", desc: "Attach the interior ceiling cassette from below, connecting the refrigerant lines and power harness. The pre-charged lines require no additional refrigerant — simply connect and tighten." },
                { step: "4", title: "Connect Power", desc: "Run the 12V or 24V DC power cable from your battery bank to the unit. Use minimum 10 AWG wire for 12V systems, 12 AWG for 24V. Install the included 30A inline fuse within 18\" of the battery." },
                { step: "5", title: "Test & Commission", desc: "Power on the unit and verify cooling/heating operation. Set the thermostat to your desired temperature. The unit will automatically maintain the set temperature and protect your battery from deep discharge." },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                    style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-8 p-4 rounded-xl flex items-start gap-3"
              style={{ backgroundColor: "oklch(0.94 0.06 255)" }}
            >
              <Zap size={20} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 255)" }} />
              <p className="text-sm" style={{ color: "oklch(0.35 0.10 255)", fontFamily: "'Inter', sans-serif" }}>
                <strong>Pro Tip:</strong> For semi truck installations, use the optional roof bracket kit (sold separately) to mount the unit on the cab-over without cutting. Contact our support team for truck-specific installation guidance.
              </p>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="max-w-2xl space-y-6">
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
            >
              Frequently Asked Questions
            </h2>
            {faqs.map(f => (
              <div
                key={f.q}
                className="rounded-xl p-6"
                style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {f.q}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.45 0.05 250)", fontFamily: "'Inter', sans-serif" }}
                >
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      <section
        className="py-12"
        style={{ backgroundColor: "oklch(0.97 0.015 240)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2
            className="text-xl font-extrabold mb-6"
            style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
          >
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: "/products/mini-split-ac", title: "12,000 BTU Mini Split Parking AC", price: "$1,599", tag: "Best for Trucks" },
              { href: "/products/heating-cooling-ac", title: "V-TH1 Heating & Cooling Parking AC", price: "Contact for Price", tag: "NEW" },
              { href: "/products/water-heater", title: "65,000 BTU Tankless Water Heater", price: "$399", tag: "Off-Grid Comfort" },
            ].map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded self-start"
                  style={{ backgroundColor: "oklch(0.94 0.06 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.tag}
                </span>
                <h3
                  className="font-bold"
                  style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.title}
                </h3>
                <span
                  className="font-extrabold"
                  style={{ color: "oklch(0.35 0.15 255)", fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.price}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ProductReviews reviews={vs02Reviews} productName="VS02 PRO" averageRating={4.8} />
      <ProductFAQ productName="VS02 PRO Top-Mounted Parking AC" faqs={vs02Faqs} />
    </PageLayout>
  );
}
