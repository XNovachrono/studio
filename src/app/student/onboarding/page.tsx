import { OnboardingWizard } from "@/components/student/onboarding-wizard";
import { Logo } from "@/components/common/logo";

export default function StudentOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute left-8 top-8">
            <Logo />
        </div>
      <OnboardingWizard />
    </div>
  );
}
