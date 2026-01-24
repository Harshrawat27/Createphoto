import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - PicLoreAI',
  description: 'Privacy Policy for PicLoreAI - Learn how we handle your data and photos.',
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className='text-4xl font-heading font-bold mb-8'>Privacy Policy</h1>
        <p className='text-muted-foreground mb-8'>Last updated: January 24, 2026</p>

        <div className='prose prose-invert max-w-none space-y-8'>
          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>1. Introduction</h2>
            <p className='text-muted-foreground leading-relaxed'>
              PicLoreAI ("we," "our," or "us") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our AI headshot generation service. Please read this policy carefully to
              understand our practices regarding your personal data.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>2. Information We Collect</h2>

            <h3 className='text-xl font-heading font-semibold mb-3 mt-6'>
              2.1 Information You Provide
            </h3>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Account Information:</strong> Name, email address, and password when you
                create an account
              </li>
              <li>
                <strong>Photos:</strong> Images you upload for AI model training and headshot
                generation
              </li>
              <li>
                <strong>Payment Information:</strong> Billing details processed securely through
                our payment provider (we do not store full credit card numbers)
              </li>
              <li>
                <strong>Communications:</strong> Information you provide when contacting us for
                support
              </li>
            </ul>

            <h3 className='text-xl font-heading font-semibold mb-3 mt-6'>
              2.2 Automatically Collected Information
            </h3>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, generation history
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, device
                identifiers
              </li>
              <li>
                <strong>Log Data:</strong> IP address, access times, referring URLs
              </li>
              <li>
                <strong>Cookies:</strong> Session cookies for authentication and preferences
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>3. How We Use Your Photos</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              Your photos are central to our service, and we take their handling seriously:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Model Training:</strong> Your uploaded photos are used to train a
                personalized AI model specifically for you
              </li>
              <li>
                <strong>Image Generation:</strong> Your trained model is used to generate headshots
                based on your requests
              </li>
              <li>
                <strong>No Third-Party Training:</strong> We do NOT use your photos to train
                general AI models or share them with other users
              </li>
              <li>
                <strong>Processing:</strong> Photos are processed using AI services from Google
                (Gemini) and OpenAI under their respective privacy policies
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>4. Data Storage and Security</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Encryption:</strong> Data is encrypted in transit (HTTPS) and at rest
              </li>
              <li>
                <strong>Secure Storage:</strong> Photos and generated images are stored on secure
                cloud infrastructure (AWS S3/Cloudflare R2)
              </li>
              <li>
                <strong>Access Controls:</strong> Only you can access your photos and generated
                images through your account
              </li>
              <li>
                <strong>Database Security:</strong> User data is stored in secure PostgreSQL
                databases with encryption
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>5. Data Retention</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              We retain your data as follows:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Account Data:</strong> Retained while your account is active and for a
                reasonable period after deletion
              </li>
              <li>
                <strong>Uploaded Photos:</strong> Retained while your AI model exists; you can
                delete your model at any time
              </li>
              <li>
                <strong>Generated Images:</strong> Retained in your gallery until you delete them
                or close your account
              </li>
              <li>
                <strong>Payment Records:</strong> Retained as required by law for accounting
                purposes
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>6. Third-Party Services</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              We use the following third-party services to provide our platform:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Google (Gemini AI):</strong> For AI image generation
              </li>
              <li>
                <strong>OpenAI:</strong> For AI image generation
              </li>
              <li>
                <strong>AWS/Cloudflare:</strong> For secure image storage
              </li>
              <li>
                <strong>Payment Processor:</strong> For secure payment handling
              </li>
              <li>
                <strong>Vercel:</strong> For hosting and analytics
              </li>
            </ul>
            <p className='text-muted-foreground leading-relaxed mt-4'>
              These services have their own privacy policies, and we encourage you to review them.
              We only share the minimum data necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>7. Your Rights</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              You have the following rights regarding your personal data:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your data (subject to legal
                retention requirements)
              </li>
              <li>
                <strong>Portability:</strong> Request your data in a portable format
              </li>
              <li>
                <strong>Withdrawal:</strong> Withdraw consent for data processing where applicable
              </li>
              <li>
                <strong>Account Deletion:</strong> Delete your entire account and associated data
              </li>
            </ul>
            <p className='text-muted-foreground leading-relaxed mt-4'>
              To exercise these rights, please contact us at{' '}
              <a
                href='mailto:harshrawat.dev@gmail.com'
                className='text-primary hover:underline'
              >
                harshrawat.dev@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>8. Cookies and Tracking</h2>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              We use cookies and similar technologies for:
            </p>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 ml-4'>
              <li>
                <strong>Essential Cookies:</strong> Required for authentication and core
                functionality
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings (e.g., dark mode)
              </li>
              <li>
                <strong>Analytics:</strong> Understand how users interact with our Service
                (Vercel Analytics)
              </li>
            </ul>
            <p className='text-muted-foreground leading-relaxed mt-4'>
              You can manage cookie preferences through your browser settings. Disabling essential
              cookies may affect Service functionality.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>9. Children's Privacy</h2>
            <p className='text-muted-foreground leading-relaxed'>
              PicLoreAI is not intended for users under 18 years of age. We do not knowingly
              collect personal information from children. If you are a parent or guardian and
              believe your child has provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>10. International Data Transfers</h2>
            <p className='text-muted-foreground leading-relaxed'>
              Your data may be processed in countries other than your own. We ensure appropriate
              safeguards are in place for international data transfers in compliance with
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>11. Data Breach Notification</h2>
            <p className='text-muted-foreground leading-relaxed'>
              In the event of a data breach that affects your personal information, we will notify
              you and relevant authorities as required by law. We will provide information about
              the breach and steps you can take to protect yourself.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>12. Changes to This Policy</h2>
            <p className='text-muted-foreground leading-relaxed'>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on our website and updating the "Last updated"
              date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-heading font-bold mb-4'>13. Contact Us</h2>
            <p className='text-muted-foreground leading-relaxed'>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <div className='mt-4 p-4 bg-secondary/30 rounded-lg'>
              <p className='text-foreground font-medium'>PicLoreAI</p>
              <p className='text-muted-foreground'>
                Email:{' '}
                <a
                  href='mailto:harshrawat.dev@gmail.com'
                  className='text-primary hover:underline'
                >
                  harshrawat.dev@gmail.com
                </a>
              </p>
            </div>
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
