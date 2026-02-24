type FaqItem = {
  q: string;
  a: React.ReactNode | string;
};
export const faqList: FaqItem[] = [
  {
    q: 'What are "minutes" and how are they used in Talvin\'s pricing?',
    a: 'Talvin\'s pricing plans are based on "minutes," which represent the total duration of AI interviews or assessments you can conduct on our platform each month. For example, a 15-minute AI-powered interview consumes 15 minutes from your monthly allowance. This allows you to pay only for the AI assessment time you actually use, making our pricing flexible and scalable for your recruitment needs.',
  },
  {
    q: 'Do my unused minutes roll over to the next month?',
    a: 'No, the minutes in your monthly plan are designed to reset at the beginning of each billing cycle and do not carry over to the following month. This ensures that you always have a fresh allocation of minutes to utilize for your recruitment activities, encouraging consistent usage and planning within your chosen tier.',
  },
  {
    q: 'How can I track my minute usage and avoid exceeding my plan?',
    a: 'You can easily monitor your real-time minute consumption directly within your Talvin dashboard. We provide clear usage metrics and alerts to help you stay informed about your current usage against your monthly allowance. This transparency empowers you to manage your assessments effectively and avoid unexpected overages.',
  },
  {
    q: 'What happens if I exceed my monthly minute allocation?',
    a: "If your recruitment needs temporarily exceed your plan's monthly minute allocation, Talvin offers flexible solutions. You will have the option to either upgrade your plan to a higher tier to accommodate increased usage or purchase additional minute packs as needed. We'll notify you as you approach your limit, giving you control over your usage and costs.",
  },
  {
    q: 'How do I choose the right Talvin pricing plan for my recruitment agency?',
    a: "To select the ideal plan, consider your average monthly volume of interviews and assessments. If you're unsure, we recommend starting with a plan that aligns with your current or projected hiring activity. You can always upgrade or adjust your plan as your needs evolve. Our sales team is also available to provide a personalized consultation to help you determine the most cost-effective plan for your organization's scale and goals.",
  },
];
