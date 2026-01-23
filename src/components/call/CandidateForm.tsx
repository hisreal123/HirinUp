"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PhoneInput from "react-phone-number-input";
import { CountrySelect } from "@/components/ui/phone-country-select";
import { countries } from "@/lib/countries";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { Interview } from "@/types/interview";

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
  onGoBack,
  onStartInterview,
  onExit,
}: CandidateFormProps) {
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
    isValidLinkedin;

  return (
    <div className="relative w-[80%] mx-auto mt-2 shadow-lg rounded-md p-2 m-2 bg-slate-50 max-h-[calc(88vh-200px)] overflow-y-auto">
      <div className="p-2">
        <h2 className="text-lg font-semibold mb-4 text-center">Candidate Information</h2>
        <div className="grid grid-cols-2 gap-3 px-4">
          {!interview?.is_anonymous && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                className={email && !isValidEmail ? "border-red-500" : ""}
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
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={(value) => setPhone(value || "")}
              placeholder="Enter phone number"
              className={!isValidPhone && phone ? "phone-input-error" : ""}
              countrySelectComponent={CountrySelect}
              numberInputProps={{
                className: !isValidPhone && phone ? "error" : "",
              }}
            />
            {!isValidPhone && phone && (
              <p className="text-xs text-red-500">
                Please enter a valid phone number
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.map((countryOption) => (
                  <SelectItem key={countryOption.value} value={countryOption.value}>
                    {countryOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="twitter">Twitter (optional)</Label>
            <Input
              id="twitter"
              type="url"
              value={twitter}
              className={!isValidTwitter ? "border-red-500" : ""}
              placeholder="https://twitter.com/yourhandle"
              onChange={(e) => setTwitter(e.target.value)}
            />
            {!isValidTwitter && (
              <p className="text-xs text-red-500">
                URL must start with https://
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn <span className="text-red-500">*</span></Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedin}
              className={!isValidLinkedin ? "border-red-500" : ""}
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
            <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
            <Input
              id="experience"
              type="number"
              value={workExperienceYears}
              placeholder="e.g. 5"
              onChange={(e) => setWorkExperienceYears(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle gap-2 mt-4">
        <Button
          className="bg-white border border-primary text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
          disabled={loading}
          onClick={onGoBack}
        >
          Go Back
        </Button>
        <Button
          className="min-w-20 h-10 rounded-xl flex flex-row justify-center mb-8 bg-primary text-white hover:bg-primary/90"
          disabled={loading || !isFormValid}
          onClick={onStartInterview}
        >
          {!loading ? "Start Interview" : <MiniLoader />}
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

