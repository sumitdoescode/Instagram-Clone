"use client";
import { useState, useEffect } from "react";
import Section from "@/components/Section";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchResults from "@/components/SearchResults";

const SearchPage = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get("query");
    const [searchText, setSearchText] = useState(query || "");
    const router = useRouter();

    // useEffect(() => {
    //     setSearchText(query || "");
    // }, [query]);

    const handleSearch = () => {
        if (!searchText.trim()) return;
        router.push(`/search?query=${searchText.trim()}`);
    };

    return (
        <Section>
            <div className="max-w-lg w-full mx-auto">
                <div className="flex flex-col items-center gap-2 w-full">
                    <Input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="text-xl" />
                    <Button type="outline" onClick={handleSearch} className="self-end">
                        Search
                    </Button>
                </div>
                <SearchResults />
            </div>
        </Section>
    );
};

export default SearchPage;
