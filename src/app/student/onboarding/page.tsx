"use client";

import { OnboardingWizard } from "@/components/student/onboarding-wizard";
import { Logo } from "@/components/common/logo";
import { withBasePath } from "@/hooks/use-base-path";

export default function StudentOnboardingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <img
        src={withBasePath("/onboarding-background.png")}
        alt="Abstract background"
        style={{ objectFit: "cover", position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
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
