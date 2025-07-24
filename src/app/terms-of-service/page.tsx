
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
             Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:font-headline prose-p:font-body prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <p>
                Welcome to Auto Insights. These Terms of Service ("Terms") govern your use of our website and the services we offer. By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services. Please read them carefully.
              </p>

              <h2>1. Use of Our Service</h2>
              <p>
                Auto Insights provides content, including articles and guides, for informational purposes only. You agree to use our service for its intended purpose and in compliance with all applicable laws. You may not use our content or services for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
              </p>

              <h2>2. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, icons, and images, is the exclusive property of Auto Insights or its content suppliers and is protected by international copyright laws. The compilation of all content on this site is our exclusive property. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.
              </p>
              
              <h2>3. User-Generated Content</h2>
              <p>
                If you submit a question or provide content to us, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display that content in connection with the service. You are solely responsible for the content you submit and must ensure you have the right to grant us this license. We reserve the right to remove any content that we deem inappropriate, offensive, or in violation of these terms.
              </p>

              <h2>4. Disclaimer of Warranties and Limitation of Liability</h2>
              <p>
                The information provided by Auto Insights is for general informational purposes only. While we strive for accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk. Automotive repair should be performed with caution. We are not liable for any personal injury, property damage, or other loss that may result from the use of our content. For a full disclaimer, please see our Disclaimer page.
              </p>

              <h2>5. Third-Party Links and Advertising</h2>
              <p>
                Our website may contain links to third-party websites that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.
              </p>

              <h2>6. Changes to Terms of Service</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page and updating the "Last Updated" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms of Service.
              </p>

              <h2>7. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is based, without regard to its conflict of law provisions.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
