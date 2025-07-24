
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              Privacy Policy
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
                Auto Insights ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website. By using our site, you agree to the collection and use of information in accordance with this policy. We encourage you to read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>

              <h2>Information We Collect</h2>
              <p>
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
              </p>
              <ul>
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you choose to participate in various activities related to the Site, such as the contact form or newsletter subscription.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                <li><strong>User-Provided Content:</strong> When you use features like our question submission form, we process the text you provide. We use this data solely to improve the service and do not store it with personal identifiers.</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
              </p>
              <ul>
                <li>Improve our website and services.</li>
                <li>Respond to your service requests and support needs.</li>
                <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                <li>Send you a newsletter or other promotional materials if you have opted in.</li>
              </ul>

              <h2>Disclosure of Your Information</h2>
              <p>
                We do not sell, trade, or rent your personal identification information to others. We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service. We may also share your information if we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
              </p>
              
              <h2>Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us through the information provided on our Contact Us page.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
