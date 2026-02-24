'use client';

import { useRef, useEffect } from 'react';

interface HoneypotProps {
  onBotDetected?: () => void;
}

export interface HoneypotRef {
  checkHoneypot: () => boolean;
  getValues: () => { website: string; email2: string; phone: string };
}

export function Honeypot({ onBotDetected }: HoneypotProps) {
  const websiteRef = useRef<HTMLInputElement>(null);
  const email2Ref = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Check honeypot on any input change
  useEffect(() => {
    const checkForBot = () => {
      const hasInput =
        websiteRef.current?.value ||
        email2Ref.current?.value ||
        phoneRef.current?.value;
      if (hasInput && onBotDetected) {
        onBotDetected();
      }
    };

    const website = websiteRef.current;
    const email2 = email2Ref.current;
    const phone = phoneRef.current;

    website?.addEventListener('input', checkForBot);
    email2?.addEventListener('input', checkForBot);
    phone?.addEventListener('input', checkForBot);

    return () => {
      website?.removeEventListener('input', checkForBot);
      email2?.removeEventListener('input', checkForBot);
      phone?.removeEventListener('input', checkForBot);
    };
  }, [onBotDetected]);

  return (
    <>
      {/* These fields are hidden from humans but visible to bots */}
      {/* Using multiple techniques to hide: CSS, aria-hidden, tabindex */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          opacity: 0,
          height: 0,
          width: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <label htmlFor="website">Website (leave blank)</label>
        <input
          ref={websiteRef}
          type="text"
          name="website"
          id="website"
          tabIndex={-1}
          autoComplete="off"
        />

        <label htmlFor="email2">Confirm Email (leave blank)</label>
        <input
          ref={email2Ref}
          type="email"
          name="email2"
          id="email2"
          tabIndex={-1}
          autoComplete="off"
        />

        <label htmlFor="phone_number">Phone (leave blank)</label>
        <input
          ref={phoneRef}
          type="tel"
          name="phone_number"
          id="phone_number"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </>
  );
}

/**
 * Hook to use honeypot validation in forms
 */
export function useHoneypot() {
  const websiteRef = useRef<HTMLInputElement>(null);
  const email2Ref = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const checkHoneypot = (): boolean => {
    const hasInput =
      websiteRef.current?.value ||
      email2Ref.current?.value ||
      phoneRef.current?.value;
    
return !!hasInput; // Returns true if bot detected
  };

  function HoneypotFields() {
  return <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        height: 0,
        width: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <input
        ref={websiteRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
      />
      <input
        ref={email2Ref}
        type="email"
        name="email2"
        tabIndex={-1}
        autoComplete="off"
      />
      <input
        ref={phoneRef}
        type="tel"
        name="phone_number"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
}

  return { checkHoneypot, HoneypotFields };
}
