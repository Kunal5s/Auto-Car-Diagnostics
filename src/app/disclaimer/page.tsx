import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              Disclaimer
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:font-headline prose-p:font-body prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <div className="flex items-center not-prose bg-yellow-100 text-yellow-900 border border-yellow-300 rounded-lg p-6 mb-8">
                <AlertTriangle className="h-12 w-12 mr-6 shrink-0" />
                <div>
                  <h2 className="text-yellow-900 mt-0">Important Notice</h2>
                  <p className="text-yellow-800 mt-2">The information on this website is for educational and informational purposes only and should not be considered professional automotive advice. Always prioritize safety.</p>
                </div>
              </div>

              <h2>General Information</h2>
              <p>
                The content provided on Car Diagnostics BrainAi is designed to help users understand automotive issues and learn about vehicle maintenance and repair. While our team of experts and our AI systems work diligently to ensure the accuracy and timeliness of the information presented, we cannot guarantee that all information will be correct, complete, or up-to-date at all times. Vehicle technology changes rapidly, and variations between makes, models, and years can be significant. The guides and diagnostic suggestions are based on general knowledge and common scenarios.
              </p>
              
              <h2>No Professional Advice</h2>
              <p>
                The articles, AI summaries, and other content on this site are not a substitute for diagnosis or service by a qualified, professional mechanic. An incorrect diagnosis or repair can lead to further vehicle damage or compromise your safety. We strongly recommend consulting with a certified automotive technician for any complex repairs or if you are unsure about any procedure. Relying on any information provided by this site is solely at your own risk.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                Car Diagnostics BrainAi, its owners, employees, and affiliates will not be liable for any direct, indirect, incidental, consequential, or special damages of any kind, including but not limited to personal injury, property damage, loss of data, or financial loss, arising from the use or misuse of the information on this website. This includes any errors or omissions in the content. By using this website, you agree to assume all risks associated with the application of the information provided.
              </p>
              
              <h2>Safety First</h2>
              <p>
                Automotive repair can be dangerous. Always take appropriate safety precautions, including wearing safety glasses, using proper tools, and working in a well-ventilated area. Disconnect the battery before working on electrical components. Never work under a vehicle that is supported only by a jack; always use certified jack stands. If you do not have the proper tools, experience, or confidence to perform a task, please entrust it to a professional mechanic. Your safety is more important than saving money on a repair.
              </p>

              <h2>Third-Party and Advertising Disclosure</h2>
              <p>
                This website may contain links to other websites and displays advertisements from third parties, such as Google AdSense. We are not responsible for the content, accuracy, or practices of these third parties. The inclusion of any link or advertisement does not imply endorsement by Car Diagnostics BrainAi.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
