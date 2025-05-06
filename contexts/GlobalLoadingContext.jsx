"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { globalLoadingService } from "@/lib/globalLoadingService";

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
    const ctx = useContext(GlobalLoadingContext);
    if (!ctx) throw new Error("useGlobalLoading must be used within GlobalLoadingProvider");
    return ctx;
};

export const GlobalLoadingProvider = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(globalLoadingService.getCount());

    useEffect(() => {
        const unsubscribe = globalLoadingService.subscribe(setLoadingCount);
        return () => unsubscribe();
    }, []);

    return <GlobalLoadingContext.Provider value={{ loadingCount, isLoading: loadingCount > 0 }}>{children}</GlobalLoadingContext.Provider>;
};
