"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";
import { toast } from "sonner";

const SearchResults = ({ query }) => {
    const router = useRouter();

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const { data } = await axios.get(`/api/search?query=${query}`);
                if (data.success) {
                    setSearchResults(data.searchResults);
                }
            } catch (error) {
                console.log(error);
                toast.error("Error fetching search results");
            } finally {
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    if (loading) return <GlobalSpinner />;
    if (!searchResults.length) return <p className="text-lg mt-5">No Results Found</p>;

    return (
        <div className="flex flex-col gap-4 mt-5 w-full">
            {searchResults.map(({ _id, username, profileImage, gender }) => (
                <Card key={_id} className="p-5 m-0">
                    <CardHeader className="p-0 m-0 gap-0">
                        <div className="flex items-center gap-5 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={profileImage?.url} alt={`${username} profile`} className={"object-cover"} />
                                <AvatarFallback>{username?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <CardTitle className="font-medium text-xl">{username}</CardTitle>
                                {gender && <p className="text-sm mt-0.5">{gender === "male" ? "he/him" : "she/her"}</p>}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
};

export default SearchResults;
