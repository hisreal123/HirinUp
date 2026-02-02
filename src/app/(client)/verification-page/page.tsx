'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHoneypot } from '@/components/honeypot';

function VerificationPage() {
  const router = useRouter();
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [legalName, setLegalName] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState('');
  const [reason, setReason] = useState('');
  const [notIllegal, setNotIllegal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checkHoneypot, HoneypotFields } = useHoneypot();

  // Count words in reason text
  const wordCount = reason.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWords = 30;
  const isReasonValid = wordCount >= minWords;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for bot submission
    if (checkHoneypot()) {
      console.log('Bot detected - rejecting submission');
      return;
    }

    setIsSubmitting(true);

    // TODO: Implement verification logic
    console.log('Verification:', {
      professionalEmail,
      legalName,
      socialMediaLinks,
      reason,
      notIllegal,
      agreeTerms,
    });

    // Encode name and email to pass to success page
    const dataToEncode = {
      name: legalName.trim(),
      email: professionalEmail.trim(),
    };
    
    try {
      // Encode as base64, then URL-encode to handle special characters
      const jsonString = JSON.stringify(dataToEncode);
      const base64Encoded = btoa(jsonString);
      const urlSafeToken = encodeURIComponent(base64Encoded);
      
      console.log('Encoded token:', urlSafeToken);
      
      // Redirect to response page with encoded token
      router.push(`/verification-response/${urlSafeToken}`);
    } catch (error) {
      console.error('Error encoding data:', error);
      setIsSubmitting(false);
      // Fallback: redirect without token (will show 404)
      router.push('/verification-response/invalid');
    }
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
            {/* Honeypot fields - hidden from humans, visible to bots */}
            <HoneypotFields />

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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reason"
                  className="text-sm font-medium text-gray-700"
                >
                  Why do you want to use HirinUp?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    isReasonValid
                      ? 'text-gray-500'
                      : wordCount > 0
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {wordCount} / {minWords} words
                  {!isReasonValid && wordCount > 0 && ' (minimum required)'}
                </span>
              </div>
              <Textarea
                id="reason"
                placeholder="Please provide context about your intended use of HirinUp and other relevant information about who you are... (Minimum 30 words required)"
                value={reason}
                rows={6}
                className={`resize-none ${
                  reason && !isReasonValid
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
                required
                onChange={(e) => setReason(e.target.value)}
              />
              {reason && !isReasonValid && (
                <p className="text-xs text-red-500">
                  Please provide at least {minWords} words. You currently have {wordCount} word{wordCount !== 1 ? 's' : ''}.
                </p>
              )}
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
              disabled={!notIllegal || !agreeTerms || !isReasonValid || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Verification'
              )}
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
