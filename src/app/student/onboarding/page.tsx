import { OnboardingWizard } from "@/components/student/onboarding-wizard";
import { Logo } from "@/components/common/logo";
import Image from "next/image";

export default function StudentOnboardingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <Image
        src="/onboarding-background.png"
        alt="Abstract background"
        layout="fill"
        objectFit="cover"
        className="opacity-5"
      />
      <div className="absolute left-8 top-8 z-10">
        <Logo />
      </div>
      <div className="z-10 w-full">
        <OnboardingWizard />
      </div>
    </div>
  );
}
