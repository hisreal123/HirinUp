import HeroSection from './sections/hero';
import HowJobTryoutsWork from './sections/how-it-work';
import FaqSection from './sections/faq/page';
import WhyJobTryoutsSection from './sections/potential-action/page';

export default function JobTryoutsPage() {
  return (
    <>
      <HeroSection />
      <WhyJobTryoutsSection />
      <HowJobTryoutsWork />
      <FaqSection />
    </>
  );
}
