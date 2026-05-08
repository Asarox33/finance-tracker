"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/http";

export function useAuthGuard() {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
        }
    }, [router]);

    return { isAuthenticated: isAuthenticated() };
}