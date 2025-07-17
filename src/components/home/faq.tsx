import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Car Diagnostics BrainAi?",
    answer: "Car Diagnostics BrainAi is an advanced, AI-powered web platform designed to help car owners and mechanics diagnose vehicle problems with greater accuracy and speed. By leveraging cutting-edge artificial intelligence, our service interprets complex diagnostic data, such as OBD2 codes, sensor readings, and vehicle symptoms, to provide clear, understandable, and actionable repair advice. Our goal is to demystify car repairs, making them more accessible to everyone from DIY enthusiasts to professional technicians. We provide comprehensive guides, detailed explanations of trouble codes, and step-by-step repair instructions. The platform continuously learns from new data, ensuring that our diagnostic models are always up-to-date with the latest vehicle technologies and common issues. Whether you're dealing with a simple check engine light or a more complex powertrain malfunction, Car Diagnostics BrainAi is your trusted partner for reliable automotive solutions, helping you save time and money on repairs.",
  },
  {
    question: "How does the AI diagnostic process work?",
    answer: "Our AI diagnostic process begins when you input your vehicle's information, including the make, model, year, and the specific symptoms you're experiencing or the OBD2 codes you've retrieved. This data is fed into our sophisticated AI model, which cross-references it with a massive database of vehicle specifications, common failures, and successful repair records. The AI analyzes patterns and correlations that might not be obvious to a human, considering the interplay between different vehicle systems. It then generates a prioritized list of potential causes, ranked by probability. For each potential cause, the system provides a detailed explanation, the recommended diagnostic tests to confirm the issue, and a step-by-step repair guide. This process mimics the reasoning of an expert mechanic but enhances it with the power of machine learning, allowing for a more thorough and data-driven diagnosis that helps you pinpoint the exact problem faster.",
  },
  {
    question: "What are OBD2 codes and why are they important?",
    answer: "OBD2 (On-Board Diagnostics II) codes are standardized diagnostic trouble codes (DTCs) that a vehicle's onboard computer uses to report issues. When a sensor in your car detects a problem that could affect emissions, it triggers the check engine light and stores a corresponding OBD2 code. These codes are crucial because they provide the first clue to what might be wrong with your vehicle. Each code points to a specific system or component, such as 'P0301' indicating a misfire in cylinder 1. However, a code doesn't tell the whole story; it indicates the 'what' but not necessarily the 'why'. For example, a misfire could be caused by a bad spark plug, a faulty ignition coil, or a clogged fuel injector. That's where our AI comes in, helping you move from the initial code to the root cause of the problem, saving you from unnecessary guesswork and parts replacement.",
  },
  {
    question: "Can I use Car Diagnostics BrainAi if I have no mechanical experience?",
    answer: "Absolutely. Car Diagnostics BrainAi is designed for users of all skill levels, from complete novices to seasoned professionals. If you have no mechanical experience, our platform serves as an invaluable educational tool. We translate complex technical jargon into plain, easy-to-understand language. Our guides provide clear, step-by-step instructions, complete with diagrams and videos, to help you understand the problem and, in many cases, perform simple repairs yourself. For more complex issues, our platform empowers you to have a more informed conversation with your mechanic. You'll understand the potential problems and the necessary repairs, helping you avoid overcharges and ensure the work is done correctly. We believe that knowledge is power, and our goal is to give you the confidence to take control of your vehicle's health, regardless of your background.",
  },
  {
    question: "What types of vehicles are supported by your platform?",
    answer: "Our platform supports a vast range of vehicles, covering most makes and models manufactured from 1996 onwards, which is when the OBD2 standard was implemented in the United States. This includes domestic, Asian, and European cars, light trucks, SUVs, and minivans. Our database is constantly expanding to include the latest models and vehicle technologies, including hybrid and electric vehicles (EVs). While our primary focus is on OBD2-compliant vehicles, we also provide general repair and maintenance guides that are applicable to a wider variety of cars, including some pre-1996 models. To check if your specific vehicle is supported, you can simply enter its make, model, and year on our homepage. We are committed to broadening our coverage and continuously updating our AI models to ensure we provide the most comprehensive diagnostic support possible for the vehicles our users drive every day.",
  },
  {
    question: "How is Car Diagnostics BrainAi different from a standard code reader?",
    answer: "A standard OBD2 code reader is a tool that simply retrieves and displays the diagnostic trouble codes stored in your vehicle's computer. While useful for getting the initial error code, it doesn't provide any context or interpretation. It tells you the problem code, but not what it means, what might have caused it, or how to fix it. Car Diagnostics BrainAi goes far beyond this. We take that code and, using our powerful AI, analyze it in the context of your specific vehicle model and symptoms. Our platform provides a detailed explanation of the code, a list of the most likely causes ranked by probability, and comprehensive, step-by-step instructions for diagnosis and repair. We essentially act as a virtual expert mechanic, guiding you through the entire process. While a code reader is just the starting point, Car Diagnostics BrainAi is your complete solution from problem to fix.",
  },
  {
    question: "Is the information on your site reliable and up-to-date?",
    answer: "Reliability and accuracy are the cornerstones of Car Diagnostics BrainAi. Our information is sourced from a variety of reputable channels, including certified automotive technicians, official manufacturer service manuals, and extensive real-world repair data. Our AI models are continuously trained and updated with the latest information, ensuring they stay current with evolving vehicle technology and newly discovered issues. Before any guide or diagnostic information is published, it undergoes a rigorous review process by a team of automotive experts to ensure it is clear, safe, and accurate. We are committed to providing trustworthy and up-to-date content that you can depend on for all your vehicle maintenance and repair needs. We also welcome user feedback to help us constantly improve and refine our platform, ensuring it remains the most trusted resource for AI-powered car diagnostics.",
  },
  {
    question: "Do I need any special tools to use your guides?",
    answer: "The tools required will vary depending on the complexity of the job. Many of the diagnostic procedures and basic maintenance tasks featured on Car Diagnostics BrainAi can be performed with a basic set of hand tools that many car owners already have, such as a socket set, wrenches, and screwdrivers. For reading diagnostic codes, an inexpensive OBD2 scanner is highly recommended. For each repair guide, we provide a detailed list of the required tools and parts. We clearly specify if a job requires specialized equipment, like a torque wrench or a multimeter. Our goal is to empower you to handle what you can, while also providing the information you need to understand when a job is best left to a professional with specialized tools and experience. We always prioritize your safety and the integrity of your vehicle.",
  },
  {
    question: "How can your AI help diagnose intermittent problems?",
    answer: "Intermittent problems, which appear and disappear, are notoriously difficult to diagnose. Our AI is particularly effective in these situations. By allowing you to log symptoms and conditions each time the problem occurs (e.g., 'hesitation only when the engine is cold and it's raining'), the AI can identify patterns that might be missed by human observation. It analyzes these data points against its vast database of known issues and technical service bulletins (TSBs). The AI can suggest potential causes that are specifically linked to certain environmental conditions or driving habits. For example, it might correlate a specific electrical issue with high humidity, pointing to a potential moisture leak affecting a wiring harness. It can then guide you on how to test these specific components under the conditions where the fault is most likely to occur, drastically improving the chances of successfully diagnosing and fixing these elusive problems.",
  },
  {
    question: "What is the 'AI Summary' feature on the article pages?",
    answer: "The 'AI Summary' feature is a powerful tool designed to save you time and help you quickly grasp the key information in our detailed articles. When you're faced with a complex repair or a long diagnostic guide, it can be helpful to get a high-level overview before diving into the specifics. By clicking the 'Summarize with AI' button, our Genkit-powered AI reads the entire article and generates a concise, easy-to-read summary. This summary highlights the main points, critical steps, and essential takeaways. It's perfect for when you need a quick refresh on a topic or want to determine if an article is relevant to your specific problem without reading it in its entirety. This feature embodies our commitment to making car repair information as accessible and efficient as possible, using AI to enhance your learning and diagnostic experience.",
  },
];

export function Faq() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Have questions? We've got answers. Here are some of the most
              common questions we get.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-headline text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
