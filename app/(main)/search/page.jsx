import { Suspense } from "react";
import SearchPage from "@/components/SearchPage";

export default function Search() {
    return (
        <Suspense fallback={<div>Loading search...</div>}>
            <SearchPage />
        </Suspense>
    );
}
