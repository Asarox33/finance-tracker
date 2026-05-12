"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/http";

export function useAuthGuard() {
    const router = useRouter();

    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const check = () => {
            const auth = isAuthenticated();
            setAuthenticated(auth);

            if (!auth) {
                router.replace("/login");
            }
        };

        check();

        const interval = setInterval(check, 10_000);

        return () => clearInterval(interval);
    }, [router]);

    return {
        isAuthenticated: authenticated === true,
        isLoading: authenticated === null,
    };
}
