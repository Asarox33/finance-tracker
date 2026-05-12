"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {isAuthenticated} from "@/lib/http";

export function useAuthGuard() {
    const router = useRouter();

    const [authenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = isAuthenticated();

        setAuthenticated(auth);

        if (!auth) {
            router.replace("/login");
        }

        setIsLoading(false);
    }, [router]);

    return {
        isAuthenticated: authenticated,
        isLoading,
    };
}