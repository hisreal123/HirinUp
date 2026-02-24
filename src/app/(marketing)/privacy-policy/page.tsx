import CallTOActionLayout from '../layout/cta';

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-white text-[#1A1A1A] mt-[-97px] pb-28">
      {/* Title */}
      <div className="relative w-full h-[450px] bg-privacy-hero flex items-center justify-center overflow-hidden bg-black">
        {/* Content */}
        <div className="relative mt-10 z-10 text-center">
          <h1 className="text-white text-[44px] md:text-[56px] md:leading-[74px] font-normal tracking-tight mb-8">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-sm">Last updated: 24th Oct 2025</p>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-5xl mt-16 mx-auto px-4 pb-5 text-[15px] leading-[26px] text-gray-700 space-y-4">
        <p className="text-[16px] leading-[24px] font-normal">
          Last updated: November 26, 2025
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          Talvin AI (“we,” “our,” or “the platform”) is committed to protecting
          the privacy of our users and clients. This privacy policy explains how
          we collect, use, store, and share information, as well as the rights
          you have concerning your data, in compliance with the General Data
          Protection Regulation (GDPR) and other applicable data protection
          laws.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          1. Information We Collect
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We collect the following types of data:
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            1.1 Personal Data:
          </strong>{' '}
          When you sign up or use our platform, we collect personal details such
          as your name and email address.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            1.2 Company/Employer Data:
          </strong>{' '}
          When an organization uses our platform, we collect data related to the
          company, including company name, contact person details, billing
          information, and usage data related to the platform’s features. This
          data is used to provide and manage our services, for billing, and to
          communicate with our client organizations.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            1.3 Interview Data:
          </strong>{' '}
          If you participate in an AI interview through the platform, we collect
          additional information such as audio recordings and video (if enabled
          by the employer). These data are collected with your explicit consent.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            1.4 Communication Data:
          </strong>{' '}
          To provide our automated conversational features, we collect{' '}
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            Phone Numbers
          </strong>{' '}
          for user authentication, identification, and communication relevant to
          the service, including the delivery of conversational prompts and
          results. We also collect{' '}
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            {' '}
            Third-Party Conversation Data (e.g. WhatsApp Conversation Data)
          </strong>
          , which includes the text, media, and metadata of communications and
          conversations initiated through integrated third-party platforms (like
          WhatsApp). This Conversation Data is collected with explicit consent
          solely to enable the feature’s core functionality, such as interview
          analysis, candidate screening, or generation of summaries and
          insights.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            1.5 Cookies and Tracking Data:
          </strong>{' '}
          We use cookies and tracking technologies, including{' '}
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            Microsoft Clarity
          </strong>
          ,{' '}
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            Google Analytics
          </strong>
          ,
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            PostHog
          </strong>
          , and{' '}
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            Mixpanel
          </strong>
          , to enhance user experience and analyze trends. Please refer to our
          Cookie Policy for details.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          2. Data Retention Policy
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We retain personal data and Interview Data (Video/Audio) and
          Communication Data (e.g., WhatsApp Conversations) for as long as
          necessary to fulfill the purposes for which it was collected,
          including for the purposes of satisfying any legal, accounting, or
          reporting requirements. The specific retention periods are determined
          by the nature of the data and the purpose of its processing.
          Generally, data is retained until it is deleted either by the employer
          or by the job seeker. However, we implement the following specific
          retention guidelines:
        </p>
        <ul className="list-disc ps-[40px] space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Interview Data (Video/Audio):
            </strong>{' '}
            This data is retained for a period of 12 months from the date of
            collection, or until the associated employer or job seeker
            explicitly requests its deletion, whichever comes first. This period
            allows employers to complete their recruitment processes and for job
            seekers to access their data.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Personal Data:
            </strong>{' '}
            Personal data, such as name, email, and job details, is retained for
            24 months after the last active use of the platform or until an
            explicit deletion request is received.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Company/Employer Data:
            </strong>{' '}
            Data related to client organizations is retained for the duration of
            the contractual relationship and for a period of 7 years thereafter
            to comply with legal and accounting obligations.
          </li>
        </ul>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            Deletion Protocols:
          </strong>
        </p>
        <ul className="list-disc ps-[40px] space-y-1 ">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              User-Initiated Deletion:
            </strong>
            Job seekers and employers can request the deletion of their accounts
            and associated data by emailing{' '}
            <a href="mailto:help@talvin.ai" className="text-blue-600 underline">
              help@talvin.ai
            </a>
            . We will process such requests promptly and delete data from our
            active databases. Residual copies may remain on backup systems for a
            limited period before being permanently purged, in accordance with
            our data backup and recovery policies.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Automated Deletion:
            </strong>
            We are developing automated systems for data deletion based on the
            retention periods outlined above. Currently, deletion beyond
            user-initiated requests is managed manually to ensure compliance and
            data integrity. Future updates will include an admin panel for more
            streamlined data management and deletion
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          3. Data Storage Region
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          All collected data is securely stored on Amazon AWS servers located in
          Singapore. We ensure that all data transfers and storage comply with
          applicable data protection laws, including GDPR, by implementing
          appropriate safeguards such as Standard Contractual Clauses (SCCs)
          where necessary.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          4. Data Sharing with Integrations and AI Processors
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            4.1 Authorized Integrations:
          </strong>
          We do not sell or share your data with any third parties for their
          independent use. The only third parties with whom your data may be
          shared are those integrations explicitly authorized by you or your
          employer, such as Applicant Tracking Systems (ATS) products. When you
          or your employer integrates Talvin AI with an ATS, relevant data
          (e.g., candidate profiles, interview scores, video links) may be
          transferred to that ATS to facilitate your recruitment workflow. We
          ensure that such data sharing is governed by appropriate data
          processing agreements and that these third-party integrations maintain
          adequate data protection standards.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            4.2 AI Processing Partners for Feature Functionality:
          </strong>
          To provide the functionality of our AI features, including analysis,
          summarization, and conversation processing, we engage select
          third-party Large Language Model (LLM) providers, such as OpenAI and
          Gemini.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          When you utilize this feature, the following data may be transmitted
          to and processed by these partners:
        </p>
        <ul className="list-disc ps-[40px] space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Conversational Content:
            </strong>
            Input prompts, meeting transcripts, audio/video data (if
            applicable), and text interactions.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Contextual Data:
            </strong>
            Relevant profile information or metadata necessary to generate an
            accurate response or analysis.
          </li>
        </ul>
        <span className="text-[16px] m-0 p-0 leading-[24px] font-normal">
          We maintain contractual agreements with these AI partners that
          strictly prohibit them from using your data (including proprietary
          business information, conversations, and personal data) to train their
          external, publicly available AI models. This processing is solely for
          the purpose of generating output for you within the Talvin AI
          platform.
        </span>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          5. User Rights (GDPR)
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          In accordance with the General Data Protection Regulation (GDPR),
          users have the following rights regarding their personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to be Informed (Art. 12, 13, 14):
            </strong>{' '}
            You have the right to be informed about the collection and use of
            your personal data. This Privacy Policy serves to fulfill this
            obligation.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right of Access (Art. 15):
            </strong>
            You have the right to request access to the personal data we hold
            about you. We will provide a copy of your data in a commonly used
            electronic format.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to Rectification (Art. 16):
            </strong>{' '}
            You have the right to request that inaccurate or incomplete personal
            data concerning you be corrected or completed without undue delay.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to Erasure (‘Right to be Forgotten’) (Art. 17):
            </strong>{' '}
            You have the right to request the deletion of your personal data
            under certain circumstances, such as when the data is no longer
            necessary for the purposes for which it was collected.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to Restriction of Processing (Art. 18):
            </strong>{' '}
            You have the right to request the restriction of processing of your
            personal data under certain conditions, for example, if you contest
            the accuracy of the data.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to Data Portability (Art. 20):
            </strong>
            You have the right to receive your personal data in a structured,
            commonly used, and machine-readable format and to transmit that data
            to another controller without hindrance.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Right to Object (Art. 21):
            </strong>
            You have the right to object to the processing of your personal data
            in certain situations, including processing for direct marketing
            purposes.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Rights in relation to Automated Decision Making and Profiling
              (Art. 22):
            </strong>{' '}
            You have the right not to be subject to a decision based solely on
            automated processing, including profiling, which produces legal
            effects concerning you or similarly significantly affects you.
          </li>
        </ul>
        <span className="text-[16px] m-0 p-0 leading-[24px] font-normal">
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:help@talvin.ai" className="text-blue-600 underline">
            help@talvin.ai
          </a>
          . We will respond to your request within one month.
        </span>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          6. Security Measures
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We take data security seriously and implement robust technical and
          organizational measures to protect your personal and company data from
          unauthorized access, disclosure, alteration, and destruction. Our
          security measures include:
        </p>
        <ul className="list-disc ps-[40px] space-y-1">
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Encryption
            </strong>
            All data, both in transit and at rest, is encrypted using
            industry-standard encryption protocols.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Access Controls
            </strong>{' '}
            Strict access controls are in place to ensure that only authorized
            personnel have access to personal data, based on the principle of
            least privilege.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Regular Audits and Assessments
            </strong>
            We conduct regular security audits and vulnerability assessments to
            identify and address potential weaknesses.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Employee Training:
            </strong>
            Our employees receive regular training on data protection and
            security best practices.
          </li>
          <li>
            <strong className="text-[16px] leading-[24px] font-bold text-black">
              Compliance Efforts:
            </strong>{' '}
            Talvin AI is actively working towards obtaining compliance with GDPR
            and SOC-2 Type 2 standards, demonstrating our commitment to
            maintaining high levels of data security and privacy.
          </li>
        </ul>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          7. Changes to This Privacy Policy and Re-Consent
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We update this Privacy Policy from time to time to reflect changes in
          our practices or for other operational, legal, or regulatory reasons.
          Any changes will be posted on this page with an updated “Last updated”
          date. In the event of significant changes, we will notify users via
          email and require re-consent to the updated policy to ensure continued
          compliance and transparency.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          8. AI Model Training and Intellectual Property
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            8.1 Use of Customer Data for AI Model Training:
          </strong>{' '}
          We confirm that we do not use customer data (including personal data,
          company data, interview data, or feature conversational data) for
          training external, publicly available AI models.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          For all data sent to our AI Processing Partners (as detailed in
          Section 4.2), we have implemented strict contractual agreements to
          ensure that your data is never retained, analyzed, or used by those
          partners to train their models. Your data is used solely for providing
          and improving the Talvin AI platform and its features for you and your
          organization.
        </p>
        <p className="text-[16px] leading-[24px] font-normal">
          <strong className="text-[16px] leading-[24px] font-bold text-black">
            8.2 Internal Model Fine-Tuning and IP Ownership:
          </strong>{' '}
          We may fine-tune our internal AI models using anonymized and
          aggregated data to enhance the performance and accuracy of our
          services. This fine-tuning is conducted in a manner that does not
          identify individuals or organizations. Any intellectual property
          generated through the fine-tuning of our internal models remains the
          exclusive property of Talvin AI.
        </p>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          9. &nbsp;Legal Basis and Purpose for Processing
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We process your Personal Data, including your new Communication and
          Feature Data, based on the following legal grounds:
        </p>
        <ul className="list-disc ps-[40px] space-y-2">
          <li>
            Contractual Necessity: The primary purpose of processing
            Conversation Data and associated Phone Numbers is to fulfill the
            contract of service with you or your employer (i.e., to run the
            Talvin AI feature and deliver the promised analysis, summaries, or
            candidate screening services).
          </li>
          <li>
            Consent: We process conversation data and use your phone number for
            non-essential communications (like marketing via SMS/WhatsApp) only
            where we have obtained your specific, explicit, and informed
            consent.
          </li>
        </ul>
        <span className="text-[16px] m-0 p-0 leading-[24px] font-normal">
          Legitimate Interests: We use all collected data, including anonymized
          Communication Data, to improve the Talvin AI platform, enhance
          security, and prevent fraud.
        </span>
        <h2 className="text-[24px] leading-[28px] font-bold text-black">
          9.&nbsp;Legal Compliance
        </h2>
        <p className="text-[16px] leading-[24px] font-normal">
          We comply with all relevant data protection laws, including the
          General Data Protection Regulation (GDPR). Our platform is designed to
          ensure that your data remains secure and is processed according to
          industry standards and legal requirements.
        </p>
      </div>
      <CallTOActionLayout />
    </section>
  );
}
