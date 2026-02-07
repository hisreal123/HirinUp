'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Forgot password:', { email });
    setIsSubmitted(true);
  };

  return (
    <div className="flex h-screen w-full absolute top-0 left-0 z-50 bg-white">
      <div className="w-full flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-md space-y-8 border rounded-2xl p-6 shadow-md">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          {!isSubmitted ? (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Forgot Password
                </h1>
                <p className="mt-2 text-gray-600">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                Check Your Email
              </h1>
              <p className="mt-2 text-gray-600 text-center">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium">{email}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
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

export default ForgotPasswordPage;
