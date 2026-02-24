'use server';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstile(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    
return {
      success: false,
      error: 'Turnstile is not configured',
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'No verification token provided',
    };
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data: TurnstileVerifyResponse = await response.json();

    if (data.success) {
      return { success: true };
    }

    console.error('Turnstile verification failed:', data['error-codes']);
    
return {
      success: false,
      error: data['error-codes']?.join(', ') || 'Verification failed',
    };
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    
return {
      success: false,
      error: 'Failed to verify captcha',
    };
  }
}
