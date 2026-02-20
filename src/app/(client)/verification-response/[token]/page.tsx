'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DecodedData {
  name: string;
  email: string;
}

function VerificationSuccessPage() {
  const params = useParams();
  const token = params?.token as string;
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      console.error('No token provided');
      setIsValid(false);
      return;
    }

    try {
      // URL-decode first, then decode base64
      const urlDecoded = decodeURIComponent(token);
      const decoded = atob(urlDecoded);
      const data = JSON.parse(decoded) as DecodedData;
      
      
      // Validate that we have the required fields
      if (data.name && data.email && data.name.trim() && data.email.trim()) {
        setDecodedData(data);
        setIsValid(true);
      } else {
        console.error('Missing required fields:', { name: data.name, email: data.email });
        setIsValid(false);
      }
    } catch (error) {
      // Invalid token - show 404
      console.error('Error decoding token:', error);
      console.error('Token received:', token);
      setIsValid(false);
    }
  }, [token]);

  // Show 404 if token is invalid
  if (isValid === false) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Background Image */}
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth/verification-bg.jpg')" }}
        />
        {/* Purple Overlay */}
        <div className="fixed inset-0 bg-purple-900/70" />

        {/* 404 Card */}
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-8">
          <div className="w-[60%] bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500 my-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Page Not Found
                </h2>
                <p className="text-lg text-gray-600">
                  This verification page is not accessible.
                </p>
                <p className="text-sm text-gray-500">
                  Please complete the verification form to access this page.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md pt-4">
                <Button
                  asChild
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Link href="/verification-page">
                    Go to Verification Page
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                >
                  <Link href="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while decoding
  if (isValid === null || !decodedData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth/verification-bg.jpg')" }}
        />
        <div className="fixed inset-0 bg-purple-900/70" />
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth/verification-bg.jpg')" }}
      />
      {/* Purple Overlay */}
      <div className="fixed inset-0 bg-purple-900/70" />

      {/* Waiting Card */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-8">
        <div className="w-[60%] bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500 my-8">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <Clock className="h-20 w-20 text-indigo-600 animate-in zoom-in-95 duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Verification Request Submitted
              </h1>
              <p className="text-lg text-gray-600">
                Hi {decodedData.name}, please wait while we verify your information
              </p>
              <p className="text-sm text-gray-500">
                We've received your verification request for {decodedData.email}
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      What happens next?
                    </p>
                    <p className="text-sm text-gray-600">
                      Our team will review your verification request. You will receive an email notification once your verification has been processed. This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md pt-4">
              <Button
                asChild
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Link href="/signin">
                  Sign In
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 pt-4">
              Need help?{' '}
              <Link
                href="/contact"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationSuccessPage;

