import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - PicLoreAI',
  description: 'Terms of Service for PicLoreAI - AI headshot generator platform.',
};

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className='text-4xl font-heading font-bold mb-8'>Terms of Service</h1>
        <p className='text-muted-foreground mb-8'>Last updated: January 24, 2026</p>

        <div className='prose prose-invert max-w-none space-y-8'>
          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>1. Acceptance of Terms</h2>
            <p className='text-muted-foreground leading-relaxed'>
              By accessing or using PicLoreAI ("Service"), you agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              We reserve the right to modify these Terms at any time, and your continued use of the
              Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>2. Description of Service</h2>
            <p className='text-muted-foreground leading-relaxed'>
              PicLoreAI is an AI-powered platform that allows users to create personalized AI models
              from uploaded photographs and generate professional headshots and images. The Service
              uses artificial intelligence technologies including but not limited to Google Gemini
              and OpenAI to process and generate images.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>3. Account Registration</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years old or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>4. User Content and Uploads</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              When you upload photos to PicLoreAI, you represent and warrant that:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>You own the photos or have the right to use them</li>
              <li>The photos are of yourself or you have consent from the person depicted</li>
              <li>The content does not violate any third-party rights</li>
              <li>The content is not illegal, offensive, or harmful</li>
              <li>You will not upload photos of minors without parental consent</li>
            </ul>
            <p className='text-muted-foreground leading-relaxed mt-4'>
              You retain ownership of the photos you upload. By uploading, you grant PicLoreAI a
              limited license to process these photos solely for the purpose of providing the
              Service to you.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>5. Generated Content Ownership</h2>
            <p className='text-muted-foreground leading-relaxed'>
              Images generated through PicLoreAI are owned by you, the user. You may use generated
              images for personal and commercial purposes, including but not limited to LinkedIn
              profiles, company websites, marketing materials, and social media. However, you may
              not claim that AI-generated images are traditional photographs if doing so would be
              misleading in a material way.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>6. Credits and Payments</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              PicLoreAI operates on a credit-based system:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>Credits are required to generate images</li>
              <li>Different AI models may consume different amounts of credits</li>
              <li>Credits are non-refundable and non-transferable</li>
              <li>Unused credits in subscription plans do not roll over</li>
              <li>Prices are subject to change with notice</li>
            </ul>
            <p className='text-muted-foreground leading-relaxed mt-4'>
              Payments are processed securely through our payment provider. By making a purchase,
              you agree to provide accurate payment information and authorize us to charge your
              payment method.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>7. Subscription Plans</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              Subscription plans automatically renew unless cancelled. You may cancel your
              subscription at any time through your account settings. Cancellation takes effect at
              the end of the current billing period. No refunds are provided for partial billing
              periods.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>8. Prohibited Uses</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              You agree not to use PicLoreAI to:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>Create deepfakes or misleading content intended to deceive</li>
              <li>Generate explicit, pornographic, or adult content</li>
              <li>Create content that harasses, threatens, or defames others</li>
              <li>Impersonate others without their consent</li>
              <li>Generate content that violates any laws or regulations</li>
              <li>Attempt to reverse-engineer or extract our AI models</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>9. AI Limitations and Disclaimer</h2>
            <p className='text-muted-foreground leading-relaxed'>
              AI-generated content may not be perfect. Results can vary based on input quality and
              AI model performance. We do not guarantee that generated images will meet your
              specific requirements or expectations. The Service is provided "as is" without
              warranties of any kind. We are not responsible for how you use generated content or
              any consequences arising from such use.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>10. Intellectual Property</h2>
            <p className='text-muted-foreground leading-relaxed'>
              The PicLoreAI platform, including its design, features, and underlying technology, is
              owned by PicLoreAI and protected by intellectual property laws. You may not copy,
              modify, distribute, or create derivative works of our platform without permission.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>11. Account Termination</h2>
            <p className='text-muted-foreground leading-relaxed'>
              We reserve the right to suspend or terminate your account at our discretion if you
              violate these Terms or engage in behavior that we deem harmful to the Service or
              other users. Upon termination, your right to use the Service ceases immediately, and
              we may delete your data in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>12. Limitation of Liability</h2>
            <p className='text-muted-foreground leading-relaxed'>
              To the maximum extent permitted by law, PicLoreAI shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Service. Our total liability shall not exceed the amount you paid to us in
              the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>13. Indemnification</h2>
            <p className='text-muted-foreground leading-relaxed'>
              You agree to indemnify and hold harmless PicLoreAI, its affiliates, and their
              respective officers, directors, employees, and agents from any claims, damages,
              losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>14. Changes to Terms</h2>
            <p className='text-muted-foreground leading-relaxed'>
              We may update these Terms from time to time. We will notify users of material changes
              by posting the updated Terms on our website and updating the "Last updated" date.
              Your continued use of the Service after changes constitutes acceptance of the new
              Terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>15. Governing Law</h2>
            <p className='text-muted-foreground leading-relaxed'>
              These Terms shall be governed by and construed in accordance with applicable laws.
              Any disputes arising from these Terms or the Service shall be resolved through
              binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>16. Contact Information</h2>
            <p className='text-muted-foreground leading-relaxed'>
              If you have any questions about these Terms, please contact us at:{' '}
              <a
                href='mailto:harshrawat.dev@gmail.com'
                className='text-primary hover:underline'
              >
                harshrawat.dev@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className='mt-12 pt-8 border-t border-border'>
          <Link href='/' className='text-primary hover:underline'>
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
