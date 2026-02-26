import Link from 'next/link';

const SECTION_CLASS =
  'mb-4 text-xl font-semibold leading-[53px] tracking-wider text-gray-500';
const LINK_LIST_CLASS = 'space-y-3 text-sm text-white';

const productLinks = [
  { href: '/ai-candidate-screening', label: 'AI Candidate Screening' },
  { href: '/job-tryouts', label: 'Job Tryouts' },
  { href: '/pricing', label: 'Pricing' },
];

const companyLinks = [
  { href: '/ethical-ai', label: 'Ethical use of AI' },
  { href: '/book-a-demo', label: 'Book a Demo' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-condition', label: 'Terms And Conditions' },
];

function getContactItems() {
  const items: { href: string; label: string }[] = [];
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (phone) {
    items.push({ href: `tel:${phone.replace(/\D/g, '')}`, label: phone });
  }
  if (email) {
    items.push({ href: `mailto:${email}`, label: email });
  }
  
return items;
}

const socialLinks = [
  {
    href: 'https://www.youtube.com/channel/UCpmabVvq8rdThBX0l0aVsQQ',
    label: 'YouTube',
    path: 'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z',
    viewBox: '0 0 576 512',
  },
  {
    href: 'https://www.instagram.com/talvin.ai',
    label: 'Instagram',
    path: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
    viewBox: '0 0 448 512',
  },
  {
    href: 'https://www.linkedin.com/company/talvin-ai/',
    label: 'LinkedIn',
    path: 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z',
    viewBox: '0 0 448 512',
  },
  {
    href: 'https://x.com/talvinai',
    label: 'X',
    path: 'M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z',
    viewBox: '0 0 512 512',
  },
];

const footerSections = [
  { title: 'Product', links: productLinks },
  { title: 'Company', links: companyLinks },
];

function LinkList({
  links,
  className,
}: {
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <ul className={className ?? LINK_LIST_CLASS}>
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link href={href}>{label}</Link>
        </li>
      ))}
    </ul>
  );
}

export default function FooterSection() {
  return (
    <footer className="relative w-full bg-footer pb-32 overflow-hidden text-white">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 justify-center text-center">
          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h4 className={SECTION_CLASS}>{title}</h4>
              <LinkList links={links} />
            </div>
          ))}

          <div>
            <h4 className={SECTION_CLASS}>Legal</h4>
            <LinkList
              links={legalLinks}
              className="mb-6 space-y-3 text-sm text-white"
            />
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Contact Us
            </h4>
            {getContactItems().map(({ href, label }) => (
              <p key={href} className="text-sm text-gray-400">
                <a href={href} className="hover:text-purple-600">
                  {label}
                </a>
              </p>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Talvin. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            {socialLinks.map(({ href, label, path, viewBox }) => (
              <Link
                key={href}
                target="_blank"
                rel="noopener noreferrer"
                href={href}
                className="transition hover:text-white"
                aria-label={label}
              >
                <svg
                  className="w-6 h-6"
                  fill="#ffffff"
                  viewBox={viewBox}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d={path} />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
