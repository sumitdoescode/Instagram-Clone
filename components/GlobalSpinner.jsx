"use client";

import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Loader2 } from "lucide-react";

const GlobalSpinner = () => {
    const { isLoading } = useGlobalLoading();
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
    );
};

export default GlobalSpinner;
