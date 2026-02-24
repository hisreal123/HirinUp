import FaqSection from './sections/faq/page';
import HeroSection from './sections/hero';
import SolutionSection from './sections/solution';
import TalvinUseCasesSection from './sections/use-case/use-cases';

export default function AICandidateScreeningPage() {
  return (
    <>
      <HeroSection />
      <SolutionSection />
      <TalvinUseCasesSection />
      <FaqSection />
    </>
  );
}
