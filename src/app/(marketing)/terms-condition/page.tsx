'use client';
import { Sora } from 'next/font/google';
import CallTOActionLayout from '../layout/cta';

const sora = Sora({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
});

export default function TermsConditionPage() {
  return (
    <section className="bg-white text-[#1A1A1A] mt-[-97px] pb-28">
      {/* Title */}
      <div className="relative w-full h-[450px] bg-privacy-hero flex items-center justify-center overflow-hidden bg-black">
        {/* Content */}
        <div className="relative mt-10 z-10 text-center">
          <h1 className="text-white text-[44px] md:text-[56px] md:leading-[74px] font-normal tracking-tight mb-8">
            Terms and Conditions
          </h1>
          <p className="text-gray-300 text-sm">Last updated: 12th May 2025</p>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-5xl mt-16 mx-auto px-4 pb-5 text-[15px] leading-[26px] text-gray-700 space-y-4">
        <p className="text-[16px] leading-[24px] font-normal">
          Last updated: November 26, 2025
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          Welcome to Talvin (“we,” “us,” “Talvin LLC,” “Talvin AI Interviewer,”
          or “the platform”). These Terms and Conditions govern the use of our
          platform by both employers and job seekers. By accessing or using
          Talvin AI Interviewer, you agree to abide by these terms.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          1. Service Offerings
        </h2>

        <p className="text-[16px] leading-[24px] font-normal">
          We collect the following types of data:
        </p>
        <div className={` space-y-1`}>
          <p className="text-[16px] leading-[24px] font-normal">
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              1.1
            </strong>{' '}
            AI interview screening
          </p>
          <p className="text-[16px] leading-[24px] font-normal">
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              1.2
            </strong>{' '}
            Analytics for employers
          </p>
          <p className="text-[16px] leading-[24px] font-normal">
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              1.3
            </strong>{' '}
            Multilingual AI interviews
          </p>
          <p className="text-[16px] leading-[24px] font-normal">
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              1.4
            </strong>{' '}
            Collection of interview data (video, audio, and screenshots)
          </p>
          <p className="text-[16px] leading-[24px] font-normal">
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              1.5
            </strong>{' '}
            Additional functionalities related to HR technology
          </p>
        </div>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          2. Eligibility
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          Users (both employers and job seekers) are responsible for:
        </p>
        <ul className="list-none  space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              3.1 Accuracy of Information:
            </strong>{' '}
            You must provide accurate and up-to-date information when creating
            accounts or submitting data. This includes details such as job
            descriptions, personal details, and interview responses.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              3.2 Compliance with Legal Requirements:
            </strong>{' '}
            Employers and job seekers must ensure their use of the platform
            complies with applicable laws and regulations.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              3.3 Account Security:
            </strong>{' '}
            Users are responsible for maintaining the confidentiality of their
            account information and for any activities that occur under their
            account.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          4. Account and Service Use
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          By using Talvin AI Interviewer, users agree to:
        </p>
        <ul className="list-none  space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              4.1
            </strong>{' '}
            Use the platform in accordance with these terms and any applicable
            laws.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              4.2
            </strong>{' '}
            Not misuse or exploit the platform for illegal or unauthorized
            purposes.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              4.3
            </strong>{' '}
            Not engage in activities that harm the platform, such as attempts to
            hack, breach security, or overload the system.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          5. Payment and Billing
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We offer four paid plans: Starter, Growth, Pro, and Enterprise, with
          both monthly and annual subscription options.
        </p>
        <ul className="list-none  space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              5.1 Payment Terms:
            </strong>{' '}
            Once subscribed, the payment is non-refundable.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              5.2 Cancellation:
            </strong>{' '}
            You may cancel your recurring subscription at any time, but no
            refunds will be provided. You will continue to have access to the
            platform until the end of the subscription period.
          </li>
        </ul>

        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          6. Data Ownership and Usage
        </h2>
        <ul className="list-none space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              6.1
            </strong>{' '}
            Talvin AI Interviewer owns the data collected during the interview
            process. This includes, but is not limited to, personal details,
            interview responses, video, audio recordings, and screenshots (where
            applicable). Data is shared with employers for review and
            decision-making purposes. Consent for data collection is obtained
            from job seekers before conducting AI interviews.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          7. Liability and Disclaimers
        </h2>
        <ul className="list-none  space-y-1">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              7.1 Platform Downtime:
            </strong>{' '}
            While we strive to maintain the platform’s availability, we do not
            guarantee uninterrupted access. We are not liable for any damages or
            losses resulting from platform downtime, technical issues, or errors
            in AI screening.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              7.2 Accuracy of AI Results:
            </strong>{' '}
            The AI tools provided on our platform offer assistance in screening
            candidates but do not guarantee 100% accuracy. Employers should use
            additional methods for candidate evaluation.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              7.3 Third-Party Use:
            </strong>{' '}
            We are not responsible for any misuse of data by employers or third
            parties once it has been shared in compliance with these terms.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Employee Training:
            </strong>{' '}
            Our employees receive regular training on data protection and
            security best practices.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          8. Termination of Service
        </h2>
        <ul className="list-none space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              8.1
            </strong>{' '}
            Violation of these terms or applicable laws
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              8.2
            </strong>{' '}
            Providing false or misleading information
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              8.3
            </strong>{' '}
            Misuse of the platform, including attempts to hack or otherwise harm
            the system
          </li>
        </ul>
        <p className="text-[16px] leading-[24px] font-normal">
          Upon termination, user data may be retained or deleted at our
          discretion, based on applicable legal requirements and company
          policies.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          9. Intellectual Property
        </h2>
        <ul className="list-none space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              9.1
            </strong>{' '}
            Talvin is a registered trademark. All content, branding, and
            functionalities on the platform are the intellectual property of
            Talvin LLC and cannot be used, copied, or distributed without
            written permission.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          10. Governing Law and Dispute Resolution
        </h2>
        <ul className="list-none space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              10.1
            </strong>{' '}
            These Terms and Conditions are governed by the laws of the State of
            Delaware, United States. Any disputes arising out of or related to
            the use of Talvin AI Interviewer will be subject to the exclusive
            jurisdiction of the courts located in Delaware.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          11. Modifications to the Terms
        </h2>
        <ul className="list-none space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              11.1
            </strong>{' '}
            We reserve the right to update or modify these Terms and Conditions
            at any time. Any changes will be posted on this page, and it is the
            responsibility of users to review the terms regularly. Continued use
            of the platform after modifications constitutes acceptance of the
            updated terms.
          </li>
        </ul>
      </div>
      <CallTOActionLayout />
    </section>
  );
}
