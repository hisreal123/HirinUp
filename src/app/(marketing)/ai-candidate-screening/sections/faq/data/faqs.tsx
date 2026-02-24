type FaqItem = {
  q: string;
  a: React.ReactNode | string;
};
export const faqList: FaqItem[] = [
  {
    q: 'What is a Voice AI recruiter, and how does it work?',
    a: (
      <>
        <p>
          A Voice AI recruiter is an advanced candidate assessment tool that
          conducts voice-based interviews. Unlike chatbots or text-only AI,
          Talvin simulates real conversations to assess:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-5">
          <li>Communication skills</li>
          <li>Intent and confidence</li>
          <li>Job-specific knowledge</li>
        </ul>
        <p className="mt-4">
          Using AI candidate screening technology, it listens, understands, and
          evaluates responses with NLP and machine learning, giving you an
          accurate view of every applicant in minutes.
        </p>
      </>
    ),
  },
  {
    q: 'How secure is the data collected by AI voice recruiters?',
    a: 'Security is a top priority at Talvin. All candidate data, including voice recordings and transcriptions, is encrypted and stored securely in compliance with GDPR and other major data privacy regulations. As a trusted AI recruiter, Talvin gives both employers and candidates confidence that their information is safe and confidential.',
  },
  {
    q: 'How is Voice AI different from chat-based or text-based AI recruitment tools?',
    a: 'Voice AI offers a more human-like and emotionally intelligent experience. Unlike text-based tools that rely on typed responses, a Voice AI recruiter like Talvin can detect tone, pace, hesitations, and enthusiasm. This provides a richer understanding of the candidate and enables more accurate, data-driven hiring decisions.',
  },
  {
    q: 'Can voice AI recruiters reduce bias in hiring?',
    a: 'Yes. One of the major benefits of using a Voice AI recruiter like Talvin is its ability to minimize unconscious bias. By standardizing interview questions and analyzing responses based on objective criteria, Talvin ensures every candidate is evaluated fairly—regardless of gender, ethnicity, or background. This creates a more inclusive and equitable hiring process.',
  },
  {
    q: 'Can Talvin AI integrate with my current ATS?',
    a: 'Talvin integrates with more than 20 ATS platforms from around the world – including Ashby, Teamtailor, SAP SuccessFactors, Recruitee, Manatala, Greenhouse, Workable, and Workday.',
  },

  {
    q: 'Can voice AI recruiters handle multilingual interviews?',
    a: 'Absolutely. Talvin is designed to support multilingual interviews, making it an ideal AI recruiter for global teams. Candidates can interview in their preferred language, and the system will still analyze tone, sentiment, and content effectively. This helps companies build diverse, international teams without language barriers.',
  },
  {
    q: 'Can Voice AI actually replace human recruiters?',
    a: "While AI recruiters like Talvin can automate many time-consuming tasks—such as initial screenings and reference checks—they're not meant to replace humans. Instead, Talvin enhances the recruiting process by giving human recruiters more time to focus on strategy, culture fit, and final interviews. Think of it as your AI-powered hiring assistant that never sleeps.",
  },

  {
    q: 'How does the pricing work?',
    a: 'Our monthly subscriptions provide credits that can be used for AI interviews and reference calls. Each interview uses 1 credit per minute. For reference calls, credit usage may vary depending on the region being called.',
  },
];
