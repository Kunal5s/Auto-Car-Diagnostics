
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Auto Insights?",
    answer: "Auto Insights is an advanced web platform designed to help car owners and mechanics diagnose vehicle problems with greater accuracy and speed. We provide comprehensive guides, detailed explanations of trouble codes, and step-by-step repair instructions. Our goal is to demystify car repairs, making them more accessible to everyone from DIY enthusiasts to professional technicians. Whether you're dealing with a simple check engine light or a more complex powertrain malfunction, Auto Insights is your trusted partner for reliable automotive solutions, helping you save time and money on repairs.",
  },
  {
    question: "What are OBD2 codes and why are they important?",
    answer: "OBD2 (On-Board Diagnostics II) codes are standardized diagnostic trouble codes (DTCs) that a vehicle's onboard computer uses to report issues. When a sensor in your car detects a problem that could affect emissions, it triggers the check engine light and stores a corresponding OBD2 code. These codes are crucial because they provide the first clue to what might be wrong with your vehicle. Each code points to a specific system or component, such as 'P0301' indicating a misfire in cylinder 1. However, a code doesn't tell the whole story; it indicates the 'what' but not necessarily the 'why'. For example, a misfire could be caused by a bad spark plug, a faulty ignition coil, or a clogged fuel injector.",
  },
  {
    question: "Can I use Auto Insights if I have no mechanical experience?",
    answer: "Absolutely. Auto Insights is designed for users of all skill levels, from complete novices to seasoned professionals. If you have no mechanical experience, our platform serves as an invaluable educational tool. We translate complex technical jargon into plain, easy-to-understand language. Our guides provide clear, step-by-step instructions, complete with diagrams, to help you understand the problem and, in many cases, perform simple repairs yourself. For more complex issues, our platform empowers you to have a more informed conversation with your mechanic. We believe that knowledge is power, and our goal is to give you the confidence to take control of your vehicle's health.",
  },
  {
    question: "What types of vehicles are supported by your platform?",
    answer: "Our platform supports a vast range of vehicles, covering most makes and models manufactured from 1996 onwards, which is when the OBD2 standard was implemented in the United States. This includes domestic, Asian, and European cars, light trucks, SUVs, and minivans. Our database is constantly expanding to include the latest models and vehicle technologies, including hybrid and electric vehicles (EVs). While our primary focus is on OBD2-compliant vehicles, we also provide general repair and maintenance guides that are applicable to a wider variety of cars, including some pre-1996 models.",
  },
  {
    question: "Is the information on your site reliable and up-to-date?",
    answer: "Reliability and accuracy are the cornerstones of Auto Insights. Our information is sourced from a variety of reputable channels, including certified automotive technicians and official manufacturer service manuals. Before any guide or diagnostic information is published, it undergoes a rigorous review process by a team of automotive experts to ensure it is clear, safe, and accurate. We are committed to providing trustworthy and up-to-date content that you can depend on for all your vehicle maintenance and repair needs. We also welcome user feedback to help us constantly improve and refine our platform.",
  },
  {
    question: "Do I need any special tools to use your guides?",
    answer: "The tools required will vary depending on the complexity of the job. Many of the diagnostic procedures and basic maintenance tasks featured on Auto Insights can be performed with a basic set of hand tools that many car owners already have, such as a socket set, wrenches, and screwdrivers. For reading diagnostic codes, an inexpensive OBD2 scanner is highly recommended. For each repair guide, we provide a detailed list of the required tools and parts. We clearly specify if a job requires specialized equipment, like a torque wrench or a multimeter. We always prioritize your safety and the integrity of your vehicle.",
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
