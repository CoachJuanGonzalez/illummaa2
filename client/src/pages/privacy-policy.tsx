export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()} | 
          <strong> Version:</strong> 2025.1 | 
          <strong> Compliance:</strong> CASL, PIPEDA, Provincial Privacy Laws
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>ILLUMMAA collects personal information through our assessment form including:</p>
        <ul>
          <li>Contact details (name, email, phone, company)</li>
          <li>Project information (scale, budget, timeline, location)</li>
          <li>Communication preferences and consent records</li>
          <li>Technical data (IP address, browser information, session data)</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>Your information is used exclusively for:</p>
        <ul>
          <li>Providing modular construction services and consultation</li>
          <li>Responding to inquiries and project assessments</li>
          <li>Sending updates about services (with your explicit consent)</li>
          <li>Legal compliance and security protection</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Legal Basis for Processing</h2>
        <p>We process your information based on:</p>
        <ul>
          <li><strong>Explicit Consent:</strong> For marketing communications via email, SMS, WhatsApp</li>
          <li><strong>Contract Performance:</strong> To provide requested services</li>
          <li><strong>Legal Obligations:</strong> To comply with CASL and PIPEDA requirements</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Rights Under Canadian Privacy Law</h2>
        <p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request copies of your personal information</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
          <li><strong>Consent Withdrawal:</strong> Withdraw consent for marketing communications at any time</li>
          <li><strong>Complaint:</strong> File complaints with provincial privacy commissioners</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Information Sharing and Disclosure</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Service providers (CRM systems, communication platforms) under strict data protection agreements</li>
          <li>Professional advisors (legal, accounting) when necessary</li>
          <li>Law enforcement or regulatory bodies when legally required</li>
        </ul>
        <p><strong>We never sell your personal information to third parties.</strong></p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
        <p>We protect your information through:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Multi-factor authentication for system access</li>
          <li>Regular security audits and monitoring</li>
          <li>Employee training on privacy protection</li>
          <li>Secure data centers with physical access controls</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Communication Consent and CASL Compliance</h2>
        <p>Our communications comply with Canada's Anti-Spam Legislation (CASL):</p>
        <ul>
          <li>We only send commercial messages with your explicit consent</li>
          <li>All messages include clear sender identification</li>
          <li>One-click unsubscribe options are provided in every communication</li>
          <li>We maintain detailed consent records for legal compliance</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Retention</h2>
        <p>We retain your personal information for:</p>
        <ul>
          <li><strong>Active inquiries:</strong> Until project completion plus 7 years</li>
          <li><strong>Marketing consent:</strong> Until withdrawn or 3 years of inactivity</li>
          <li><strong>Legal records:</strong> As required by applicable laws</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. International Transfers</h2>
        <p>Your information may be processed in:</p>
        <ul>
          <li>Canada (primary data processing)</li>
          <li>United States (cloud service providers with adequate safeguards)</li>
          <li>All transfers comply with PIPEDA adequacy requirements</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Cookies and Tracking</h2>
        <p>Our website uses:</p>
        <ul>
          <li>Essential cookies for security and functionality</li>
          <li>Analytics cookies to improve user experience</li>
          <li>You can control cookie preferences through your browser settings</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Information</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Privacy Officer:</strong> privacy@illummaa.ca</p>
          <p><strong>General Inquiries:</strong> info@illummaa.ca</p>
          <p><strong>Mailing Address:</strong> [Your Business Address]</p>
          <p><strong>Phone:</strong> [Your Business Phone]</p>
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This Policy</h2>
        <p>We may update this privacy policy to reflect changes in our practices or legal requirements. Significant changes will be communicated via email to users who have provided consent for communications.</p>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm"><strong>Questions or Concerns?</strong> Contact our Privacy Officer at privacy@illummaa.ca or use the contact information above. You also have the right to file a complaint with your provincial privacy commissioner.</p>
        </div>
      </div>
    </div>
  );
}