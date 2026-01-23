import { useState, useEffect, useRef } from "react";
import { testEmail } from "@/lib/utils";
import { isValidPhoneNumber } from "react-phone-number-input";

export const useCandidateForm = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [workExperienceYears, setWorkExperienceYears] = useState<string>("");

  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPhone, setIsValidPhone] = useState<boolean>(true);
  const [isValidTwitter, setIsValidTwitter] = useState<boolean>(true);
  const [isValidLinkedin, setIsValidLinkedin] = useState<boolean>(true);

  // Debounce timers
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const twitterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const linkedinTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (emailTimerRef.current) {
      clearTimeout(emailTimerRef.current);
    }
    emailTimerRef.current = setTimeout(() => {
      setIsValidEmail(testEmail(email));
    }, 300);
    return () => {
      if (emailTimerRef.current) {
        clearTimeout(emailTimerRef.current);
      }
    };
  }, [email]);

  useEffect(() => {
    if (phoneTimerRef.current) {
      clearTimeout(phoneTimerRef.current);
    }
    phoneTimerRef.current = setTimeout(() => {
      if (phone && phone.trim()) {
        const isValid = isValidPhoneNumber(phone);
        setIsValidPhone(isValid);
      } else {
        setIsValidPhone(true);
      }
    }, 300);
    return () => {
      if (phoneTimerRef.current) {
        clearTimeout(phoneTimerRef.current);
      }
    };
  }, [phone]);

  useEffect(() => {
    if (twitterTimerRef.current) {
      clearTimeout(twitterTimerRef.current);
    }
    twitterTimerRef.current = setTimeout(() => {
      if (twitter && twitter.trim()) {
        const url = twitter.trim();
        setIsValidTwitter(url.startsWith("https://") || url === "");
      } else {
        setIsValidTwitter(true);
      }
    }, 300);
    return () => {
      if (twitterTimerRef.current) {
        clearTimeout(twitterTimerRef.current);
      }
    };
  }, [twitter]);

  useEffect(() => {
    if (linkedinTimerRef.current) {
      clearTimeout(linkedinTimerRef.current);
    }
    linkedinTimerRef.current = setTimeout(() => {
      if (linkedin && linkedin.trim()) {
        const url = linkedin.trim();
        setIsValidLinkedin(url.startsWith("https://") || url === "");
      } else {
        setIsValidLinkedin(true);
      }
    }, 300);
    return () => {
      if (linkedinTimerRef.current) {
        clearTimeout(linkedinTimerRef.current);
      }
    };
  }, [linkedin]);

  const isFormValid = (
    isAnonymous: boolean,
    requiredFields: {
      fullName: boolean;
      phone: boolean;
      country: boolean;
      gender: boolean;
      workExperienceYears: boolean;
      linkedin: boolean;
    }
  ) => {
    return (
      (isAnonymous || isValidEmail) &&
      requiredFields.fullName &&
      requiredFields.phone &&
      isValidPhone &&
      requiredFields.country &&
      requiredFields.gender &&
      requiredFields.workExperienceYears &&
      requiredFields.linkedin &&
      isValidTwitter &&
      isValidLinkedin
    );
  };

  return {
    email,
    setEmail,
    name,
    setName,
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
    isFormValid,
  };
};

