'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PhoneInput from 'react-phone-number-input';
import { CountrySelect } from '@/components/ui/phone-country-select';
import { countries } from '@/lib/countries';
import MiniLoader from '../loaders/mini-loader/miniLoader';
import { Interview } from '@/types/interview';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface CandidateFormProps {
  interview: Interview;
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  country: string;
  setCountry: (country: string) => void;
  twitter: string;
  setTwitter: (twitter: string) => void;
  linkedin: string;
  setLinkedin: (linkedin: string) => void;
  workExperienceYears: string;
  setWorkExperienceYears: (years: string) => void;
  isValidEmail: boolean;
  isValidPhone: boolean;
  isValidTwitter: boolean;
  isValidLinkedin: boolean;
  turnstileToken: string;
  setTurnstileToken: (token: string) => void;
  onGoBack: () => void;
  onStartInterview: () => void;
  onExit: () => void;
}

export const CandidateForm = memo(function CandidateForm({
  interview,
  loading,
  email,
  setEmail,
  fullName,
  setFullName,
  phone,
  setPhone,
  gender,
  setGender,
  country,
  setCountry,
  twitter,
  setTwitter,
  linkedin,
  setLinkedin,
  workExperienceYears,
  setWorkExperienceYears,
  isValidEmail,
  isValidPhone,
  isValidTwitter,
  isValidLinkedin,
  turnstileToken,
  setTurnstileToken,
  onGoBack,
  onStartInterview,
  onExit,
}: CandidateFormProps) {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleTurnstileCallback = useCallback(
    (token: string) => {
      setTurnstileToken(token);
    },
    [setTurnstileToken]
  );

  const handleTurnstileExpired = useCallback(() => {
    setTurnstileToken('');
  }, [setTurnstileToken]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey || !turnstileRef.current) {
      return;
    }

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let killTimeout: ReturnType<typeof setTimeout> | null = null;

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          callback: handleTurnstileCallback,
          'expired-callback': handleTurnstileExpired,
          'error-callback': handleTurnstileExpired,
          theme: 'light',
          size: 'normal',
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      // Poll until the Cloudflare script (loaded in layout.tsx) is ready
      checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval!);
          checkInterval = null;
          renderWidget();
        }
      }, 100);

      // Give up after 10 seconds to avoid a zombie interval
      killTimeout = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }, 10000);
    }

    return () => {
      // Always cancel pending timers so they don't fire on a detached DOM node
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (killTimeout) {
        clearTimeout(killTimeout);
      }
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [handleTurnstileCallback, handleTurnstileExpired]);

  const isFormValid =
    (interview?.is_anonymous || isValidEmail) &&
    fullName?.trim() &&
    phone?.trim() &&
    isValidPhone &&
    country?.trim() &&
    gender &&
    workExperienceYears?.trim() &&
    linkedin?.trim() &&
    isValidTwitter &&
    isValidLinkedin &&
    turnstileToken;

  return (
    <div className="relative w-full mt-2 rounded-md px-2 max-h-[calc(88vh-200px)] overflow-y-auto">
      <div className="border-t border-gray-200 mx-2 mb-4" />
      <div className="p-2">
        <h2 className="text-lg font-semibold mb-4 mt-4 text-center">
          Your Information
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-3 gap-x-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          {!interview?.is_anonymous && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                className={email && !isValidEmail ? 'border-red-500' : ''}
                placeholder="Enter your email address"
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !isValidEmail && (
                <p className="text-xs text-red-500">
                  Please enter a valid email address
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <PhoneInput
              defaultCountry="US"
              value={phone}
              placeholder="Enter phone number"
              className={!isValidPhone && phone ? 'phone-input-error' : ''}
              countrySelectComponent={CountrySelect}
              numberInputProps={{
                className: !isValidPhone && phone ? 'error' : '',
              }}
              international
              onChange={(value) => setPhone(value || '')}
            />
            {!isValidPhone && phone && (
              <p className="text-xs text-red-500">
                Please enter a valid phone number
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.map((countryOption) => (
                  <SelectItem
                    key={countryOption.value}
                    value={countryOption.value}
                  >
                    {countryOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">
              Years of Experience <span className="text-red-500">*</span>
            </Label>
            <Input
              id="experience"
              type="number"
              value={workExperienceYears}
              placeholder="e.g. 5"
              onChange={(e) => setWorkExperienceYears(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">
              LinkedIn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedin}
              className={!isValidLinkedin ? 'border-red-500' : ''}
              placeholder="https://linkedin.com/in/yourprofile"
              onChange={(e) => setLinkedin(e.target.value)}
            />
            {!isValidLinkedin && (
              <p className="text-xs text-red-500">
                URL must start with https://
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter (optional)</Label>
            <Input
              id="twitter"
              type="url"
              value={twitter}
              className={!isValidTwitter ? 'border-red-500' : ''}
              placeholder="https://twitter.com/yourhandle"
              onChange={(e) => setTwitter(e.target.value)}
            />
            {!isValidTwitter && (
              <p className="text-xs text-red-500">
                URL must start with https://
              </p>
            )}
          </div>
        </div>
        {/* Turnstile Widget */}
        <div className="col-span-2 flex justify-center mt-6">
          <div ref={turnstileRef} />
        </div>
      </div>
      <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle gap-2 mt-4">
        <Button
          className="group h-auto w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-6 transition-all duration-300 flex items-center bg-transparent hover:bg-transparent text-sm font-medium rounded-md"
          disabled={loading}
          onClick={onGoBack}
        >
          {/* <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-4 group-hover:mr-1">
            <ArrowLeft className="h-4 w-4" />
          </span> */}
          Back
        </Button>
        <Button
          className="group relative h-auto w-fit border border-transparent px-4 transition-all duration-300 flex items-center justify-center text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90"
          disabled={loading || !isFormValid}
          onClick={onStartInterview}
        >
          {/* Text (keeps width reserved) */}
          <span className={`${loading ? "opacity-0" : "opacity-100"} flex items-center`}>
            Start Interview
          </span>

          {/* Loader */}
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <MiniLoader />
            </span>
          )}
        </Button>
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-secondary hover:bg-secondary/90 text-white"
                onClick={onExit}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});
