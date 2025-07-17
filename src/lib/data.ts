import type { Article, Category, Author } from "@/lib/types";
import {
  Cog,
  Signal,
  AlertTriangle,
  AppWindow,
  Wrench,
  Fuel,
  BatteryCharging,
  TrendingUp,
} from "lucide-react";
import { Obd2Icon } from "@/components/icons/obd2-icon";

export const categories: Category[] = [
  { name: "Engine", icon: Cog },
  { name: "Sensors", icon: Signal },
  { name: "OBD2", icon: Obd2Icon },
  { name: "Alerts", icon: AlertTriangle },
  { name: "Apps", icon: AppWindow },
  { name: "Maintenance", icon: Wrench },
  { name: "Fuel", icon: Fuel },
  { name: "EVs", icon: BatteryCharging },
  { name: "Trends", icon: TrendingUp },
];

export let articles: Article[] = [
  {
    slug: "understanding-your-cars-engine",
    title: "Understanding Your Car's Engine: A Beginner's Guide",
    summary:
      "Dive into the heart of your vehicle. This guide breaks down the basics of how your car's engine works, common issues, and preventive maintenance.",
    content: `
A car engine is a complex machine that converts heat from burning gas into the force that turns the road wheels. The engine is the heart of your car. It is a complex machine built to convert heat from burning gas into the force that turns the road wheels. The chain of reactions which achieve that objective is set in motion by a spark, which ignites a mixture of petrol vapour and compressed air inside a momentarily sealed cylinder and causes it to burn rapidly. This is why the engine is called an internal combustion engine. As the mixture burns it expands, providing power to drive the car.

To withstand the high temperatures and pressures, the engine must be robustly constructed. It consists of two basic parts: the lower, heavier section is the cylinder block, a casing for the engine's main moving parts; the detachable upper cover is the cylinder head. The cylinder head contains valve-controlled passages through which the air and fuel mixture enters the cylinders, and others through which the gases produced by their combustion are expelled.

The block houses the crankshaft, which converts the reciprocating motion of the pistons into rotary motion at the flywheel. The block also houses the camshaft, which operates the valves. Sometimes the camshaft is in the head (overhead camshaft) or there are two camshafts in the head (double overhead camshaft).
    `,
    imageUrl: "https://placehold.co/600x400.png",
    altText: "Detailed illustration of a modern car engine with various parts labeled, shown against a clean, white background to emphasize its complexity and mechanical beauty.",
    imageHint: "car engine",
    category: "Engine",
    status: "published",
    publishedAt: "2024-05-20T10:00:00Z",
  },
  {
    slug: "common-car-sensors-and-what-they-do",
    title: "Common Car Sensors and What They Do",
    summary:
      "Modern cars are filled with sensors. Learn about the most important ones, like the O2 sensor and MAF sensor, and how they impact your car's performance.",
    content: `
Modern cars are equipped with a wide array of sensors that monitor everything from engine performance to passenger safety. Understanding these sensors can help you diagnose problems and maintain your vehicle.

The Oxygen (O2) Sensor measures the amount of unburned oxygen in the exhaust system. This information is used by the engine control unit (ECU) to adjust the air-fuel mixture for optimal performance and emissions.

The Mass Air Flow (MAF) Sensor measures the amount of air entering the engine. The ECU uses this data to calculate the right amount of fuel to inject. A faulty MAF sensor can cause a range of problems, including poor fuel economy and stalling.

The Coolant Temperature Sensor monitors the temperature of the engine coolant. This data helps the ECU manage fuel injection, ignition timing, and the electric cooling fan.

Other important sensors include the Throttle Position Sensor (TPS), Crankshaft Position Sensor (CKP), and Manifold Absolute Pressure (MAP) sensor. Each plays a vital role in the smooth and efficient operation of your vehicle.
    `,
    imageUrl: "https://placehold.co/600x400.png",
    altText: "A diagram showing the placement of various common car sensors like the O2 sensor, MAF sensor, and coolant temperature sensor on a generic engine block.",
    imageHint: "car dashboard",
    category: "Sensors",
    status: "published",
    publishedAt: "2024-05-18T14:30:00Z",
  },
  {
    slug: "demystifying-obd2-codes",
    title: "Demystifying OBD2 Codes",
    summary:
      "The 'Check Engine' light is on, and your mechanic mentions an OBD2 code. What does it all mean? This guide helps you understand OBD2 diagnostic codes.",
    content: `
On-Board Diagnostics II (OBD2) is a standardized system that on-board computers in cars and trucks use for self-diagnostics and reporting. When the "Check Engine" light illuminates, it means the OBD2 system has detected a problem.

A code reader can be plugged into the OBD2 port (usually located under the dashboard) to retrieve Diagnostic Trouble Codes (DTCs). These codes point to the specific issue the system has identified.

Codes are alphanumeric and start with a letter followed by four numbers. The first letter indicates the system: P for Powertrain, B for Body, C for Chassis, and U for Network.

For example, a P0301 code indicates a misfire in cylinder 1. While the code tells you what the problem is, it doesn't always tell you why it's happening. The cause could be a bad spark plug, a faulty ignition coil, or a clogged fuel injector. Further diagnosis is often required to pinpoint the exact cause.
    `,
    imageUrl: "https://placehold.co/600x400.png",
    altText: "A mechanic holding an OBD2 scanner connected to a car's port, with the device displaying a diagnostic trouble code on its screen, illustrating the process of vehicle diagnostics.",
    imageHint: "obd2 scanner",
    category: "OBD2",
    status: "published",
    publishedAt: "2024-05-15T09:00:00Z",
  },
  {
    slug: "top-5-warning-lights",
    title: "Top 5 Warning Lights You Shouldn't Ignore",
    summary:
      "From the oil pressure light to the battery alert, we cover the top 5 dashboard warning lights that require your immediate attention.",
    content: `
Dashboard warning lights are your car's way of communicating that something is wrong. While some are informational, others signal serious problems that should not be ignored.

1.  **Check Engine Light:** The most infamous light, it can indicate anything from a loose gas cap to a serious engine problem. It's best to get it checked out promptly.

2.  **Oil Pressure Warning Light:** This light looks like an old-fashioned oil can. If it comes on, it means your engine has lost normal oil pressure. Stop the car immediately and check the oil level. Driving with low oil pressure can cause severe engine damage.

3.  **Engine Temperature Warning Light:** Shaped like a thermometer, this light indicates your engine is overheating. Pull over as soon as it's safe and turn off the engine to let it cool down.

4.  **Brake System Warning Light:** This usually appears as the word "BRAKE" or an exclamation point in a circle. It could mean the parking brake is on, or there's a serious issue with your braking system, like low brake fluid.

5.  **Battery/Charging System Warning Light:** A battery-shaped icon indicates a problem with the car's electrical system, such as a failing battery, a bad alternator, or a broken serpentine belt.
    `,
    imageUrl: "https://placehold.co/600x400.png",
    altText: "A close-up shot of a car's dashboard illuminated with various warning lights, prominently featuring the check engine light, oil pressure light, and battery alert symbol.",
    imageHint: "warning lights",
    category: "Alerts",
    status: "published",
    publishedAt: "2024-05-12T11:00:00Z",
  },
  {
    slug: "essential-car-maintenance-schedule",
    title: "An Essential Car Maintenance Schedule to Follow",
    summary: "Keep your car running smoothly and prevent costly repairs by following this essential maintenance schedule. We cover everything from oil changes to tire rotations.",
    content: "Regular maintenance is key to your vehicle's longevity and performance. Here's a general schedule to follow. Check your owner's manual for specific recommendations for your model. Monthly Checks: Check oil level, coolant level, tire pressure, and windshield washer fluid. Every 3-6 Months or 3,000-5,000 miles: Change engine oil and filter. Check battery and cables. Inspect belts and hoses. Check all lights. Every 6-12 Months or 6,000-10,000 miles: Rotate tires. Inspect brake system. Check air filter. Annually: Inspect steering and suspension. Check wheel alignment. Replace wiper blades.",
    imageUrl: "https://placehold.co/600x400.png",
    altText: "A graphic checklist illustrating an essential car maintenance schedule, with icons for oil change, tire rotation, brake inspection, and battery check, organized by frequency.",
    imageHint: "car maintenance",
    category: "Maintenance",
    status: "published",
    publishedAt: "2024-05-10T08:00:00Z",
  },
  {
    slug: "improving-fuel-efficiency",
    title: "10 Easy Ways to Improve Your Car's Fuel Efficiency",
    summary: "Save money at the pump with these simple tips and driving habits that can significantly boost your vehicle's gas mileage.",
    content: "Want to get more miles to the gallon? Try these tips: 1. Drive smoothly and avoid aggressive acceleration and braking. 2. Observe the speed limit. Fuel economy usually decreases above 50 mph. 3. Remove excess weight from your car. 4. Reduce aerodynamic drag by removing roof racks when not in use. 5. Keep tires properly inflated. 6. Use the recommended grade of motor oil. 7. Keep your engine properly tuned. 8. Use cruise control on the highway. 9. Avoid excessive idling. 10. Combine errands into one trip to avoid multiple cold starts.",
    imageUrl: "https://placehold.co/600x400.png",
    altText: "A car's fuel gauge indicator on the dashboard pointing towards 'Full', with a green leaf symbol nearby, symbolizing improved fuel efficiency and eco-friendly driving.",
    imageHint: "fuel pump",
    category: "Fuel",
    status: "published",
    publishedAt: "2024-05-05T16:00:00Z",
  },
];

let author: Author = {
  name: "Kunal Sonpitre",
  role: "AI & Business Technical Expert",
  bio: "Kunal is an expert in automotive technology and AI, with a passion for making complex car diagnostics understandable for everyone. He combines his deep technical knowledge with clear, concise writing to empower car owners.",
  imageUrl: "https://placehold.co/100x100.png"
};


export async function getArticles(options: { includeDrafts?: boolean } = {}) {
  // This is in-memory, so it's not truly async, but we'll keep the promise to simulate a real API call.
  const sortedArticles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  if (options.includeDrafts) {
    return Promise.resolve(sortedArticles);
  }
  return Promise.resolve(sortedArticles.filter(a => a.status === 'published'));
}

export async function getArticleBySlug(slug: string) {
  // This is in-memory, so it's not truly async, but we'll keep the promise to simulate a real API call.
  return Promise.resolve(articles.find(article => article.slug === slug));
}

// NOTE: This is not a proper database. In a real application, you would use a database
// to store articles. This is a simplified approach for this prototype.
export async function addArticle(article: Omit<Article, 'publishedAt' | 'status'>) {
  const newArticle: Article = {
    ...article,
    status: 'published',
    publishedAt: new Date().toISOString(),
  }
  // This is not safe for concurrent requests but is fine for this prototype.
  articles.unshift(newArticle);
  return Promise.resolve(newArticle);
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>) {
  const articleIndex = articles.findIndex(a => a.slug === slug);
  if (articleIndex === -1) {
    throw new Error(`Article with slug "${slug}" not found.`);
  }
  
  const originalArticle = articles[articleIndex];
  
  const updatedArticle = {
    ...originalArticle,
    ...articleData,
  };

  articles[articleIndex] = updatedArticle;
  return Promise.resolve(updatedArticle);
}

export async function deleteArticle(slug: string) {
  const initialLength = articles.length;
  articles = articles.filter(article => article.slug !== slug);
  if (articles.length === initialLength) {
    throw new Error(`Article with slug "${slug}" not found.`);
  }
  return Promise.resolve();
}


// Author Data Functions
export async function getAuthor() {
    return Promise.resolve(author);
}

export async function updateAuthor(authorData: Author) {
    author = { ...author, ...authorData };
    return Promise.resolve(author);
}
