import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zero English",
  description:
    "Privacy policy for Zero English - how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-neutral dark:prose-invert space-y-6">
        <p>
          <strong>Last updated:</strong> September 2, 2026
        </p>

        <h2 className="text-xl font-semibold mt-8">1. Introduction</h2>
        <p>
          Welcome to Zero English (&quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;). We are committed to protecting your personal
          information and your right to privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you use
          our vocabulary learning platform.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          2. Information We Collect
        </h2>
        <h3 className="text-lg font-medium mt-6">
          2.1 Information You Provide
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Information:</strong> When you create an account, we
            collect your email address, name, and authentication credentials.
          </li>
          <li>
            <strong>Learning Data:</strong> We store your vocabulary learning
            progress, quiz results, bookmarks, and other learning activities to
            provide personalized features.
          </li>
          <li>
            <strong>User Preferences:</strong> Your language settings (English
            and Bengali), daily goals, and other customization options.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-6">
          2.2 Information Collected Automatically
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Usage Data:</strong> We collect information about how you
            interact with the platform, including pages visited, features used,
            and time spent.
          </li>
          <li>
            <strong>Device Information:</strong> Browser type, operating system,
            and device identifiers for analytics purposes.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and maintain our vocabulary learning services</li>
          <li>To track your learning progress and provide personalized features</li>
          <li>To improve our platform and develop new features</li>
          <li>
            To communicate with you about updates, features, or support matters
          </li>
          <li>To ensure the security and integrity of our platform</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">
          4. Data Storage and Security
        </h2>
        <p>
          Your learning data is stored locally on your device using IndexedDB for
          offline access. Account data and progress synchronization are handled
          securely through our backend services. We implement appropriate
          technical and organizational measures to protect your personal
          information.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          5. Data Sharing and Disclosure
        </h2>
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share anonymized, aggregated data that cannot be used
          to identify you personally for analytics or research purposes.
        </p>

        <h2 className="text-xl font-semibold mt-8">6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Export your learning data</li>
          <li>Opt-out of non-essential data collection</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">7. Cookies</h2>
        <p>
          We use essential cookies to maintain your session and preferences. We
          may use analytics cookies to understand how our platform is used and to
          improve the user experience. You can control cookie settings through
          your browser preferences.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          8. Children&apos;s Privacy
        </h2>
        <p>
          Our platform is not intended for children under 13 years of age. We do
          not knowingly collect personal information from children under 13. If
          we become aware that we have collected personal information from a
          child, we will take steps to delete such information.
        </p>

        <h2 className="text-xl font-semibold mt-8">
          9. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>

        <h2 className="text-xl font-semibold mt-8">10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:zeroenglishweb@gmail.com"
            className="text-primary hover:underline"
          >
            zeroenglishweb@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
