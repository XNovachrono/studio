
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import { BanksDashboardUI } from "@/components/teacher/banks/dashboard-ui";
import { auth } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { getUserProfile } from "@/lib/firestore";

export default function BanksDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userProfile = await getUserProfile(firebaseUser.uid);
                if (userProfile && (userProfile.role === 'teacher' || userProfile.role === 'admin')) {
                    setUser(userProfile);
                } else {
                    router.push('/login');
                }
            } else {
                router.push("/login");
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    if (isLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <BanksDashboardUI user={user} />;
}
