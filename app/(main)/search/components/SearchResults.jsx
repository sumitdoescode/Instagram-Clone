"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalSpinner from "@/components/GlobalSpinner";

const SearchResults = ({ query }) => {
    const { getToken } = useAuth();
    const router = useRouter();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/search?query=${query}`, token);
        if (error) throw new Error("Failed to fetch search results");
        return data;
    };

    const { data, error, isLoading } = useSWR(`/search?query=${query}`, fetcher);

    if (isLoading) return <GlobalSpinner />;
    if (error) return <p className="text-lg mt-5 text-red-500">Something went wrong.</p>;
    if (!data?.users?.length) return <p className="text-lg mt-5">No users found.</p>;

    return (
        <div className="flex flex-col gap-4 mt-5 w-full">
            {data.users.map(({ _id, username, profileImage, gender }) => (
                <Card key={_id} className="p-1 m-0">
                    <CardHeader className="p-1 m-0 gap-0">
                        <div className="flex items-center gap-5 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={profileImage?.url} alt={`${username} profile`} />
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
