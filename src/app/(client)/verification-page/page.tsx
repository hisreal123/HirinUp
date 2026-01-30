'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function VerificationPage() {
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [legalName, setLegalName] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState('');
  const [reason, setReason] = useState('');
  const [notIllegal, setNotIllegal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement verification logic
    console.log('Verification:', {
      professionalEmail,
      legalName,
      socialMediaLinks,
      reason,
      notIllegal,
      agreeTerms,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth/verification-bg.jpg')" }}
      />
      {/* Purple Overlay */}
      <div className="fixed inset-0 bg-purple-900/70" />

      {/* Form Card */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-8">
        <div className="w-[60%] bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500 my-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              Verification Hold
            </h1>
            <p className="mt-3 text-gray-600">
              Your email provider or identity requires additional verification,
              and you need to take extra steps to verify yourself. Please fill
              out the form below or create a new account with your professional
              email address.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="professionalEmail"
                className="text-sm font-medium text-gray-700"
              >
                Professional Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="professionalEmail"
                type="email"
                placeholder="Professional Email Address"
                value={professionalEmail}
                required
                onChange={(e) => setProfessionalEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="legalName"
                className="text-sm font-medium text-gray-700"
              >
                Legal Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="legalName"
                type="text"
                placeholder="Legal Name"
                value={legalName}
                required
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="socialMediaLinks"
                className="text-sm font-medium text-gray-700"
              >
                Social Media Links <span className="text-red-500">*</span>
              </label>
              <Input
                id="socialMediaLinks"
                type="text"
                placeholder="LinkedIn, X, GitHub, or other professional profiles"
                value={socialMediaLinks}
                required
                onChange={(e) => setSocialMediaLinks(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="text-sm font-medium text-gray-700"
              >
                Why do you want to use HirinUp?{' '}
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="reason"
                placeholder="Please provide context about your intended use of HirinUp and other relevant information about who you are..."
                value={reason}
                rows={4}
                className="resize-none"
                required
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="notIllegal"
                  checked={notIllegal}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  required
                  onChange={(e) => setNotIllegal(e.target.checked)}
                />
                <label
                  htmlFor="notIllegal"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I am not using HirinUp&apos;s services for any illegal
                  activities. <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  required
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I confirm that I am fully compliant with HirinUp&apos;s{' '}
                  <Link
                    href="/terms-condition"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    terms
                  </Link>
                  . <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!notIllegal || !agreeTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Verification
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
