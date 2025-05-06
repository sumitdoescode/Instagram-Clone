"use client";

import { globalLoadingService } from "@/lib/globalLoadingService";

export const globalLoadingMiddleware = (useSWRNext) => {
    return (key, fetcher, config) => {
        const wrappedFetcher = async (...args) => {
            globalLoadingService.start();
            try {
                return await fetcher(...args);
            } finally {
                globalLoadingService.stop();
            }
        };
        return useSWRNext(key, wrappedFetcher, config);
    };
};
