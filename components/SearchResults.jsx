"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SearchResults = ({ query }) => {
    const { getToken } = useAuth();
    const router = useRouter();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/search?query=${query}`, token);
    };

    const { data, error, isLoading } = useSWR(`/search?query=${query}`, fetcher);

    if (isLoading) return <h1 className="text-lg mt-5">Loading...</h1>;
    if (error) return <h1 className="text-lg mt-5">Something went wrong.</h1>;

    return (
        <div className="flex flex-col gap-4 mt-5 w-full">
            {data.users.map((user) => {
                const { _id, username, profileImage, gender } = user;
                return (
                    <Card key={_id} className="pb-0 gap-0 p-2">
                        <CardHeader className={"cursor-pointer px-1 gap-0"}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2" onClick={() => router.push(`/profile/${_id}`)}>
                                    <Avatar className={"w-10 h-10"}>
                                        <AvatarImage src={profileImage} alt={`${username} profileImage`} size={40} />
                                        <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <CardTitle className="font-medium">{username}</CardTitle>
                                        {gender && <CardDescription className="text-sm">{gender === "male" ? "he/him" : "she/her"}</CardDescription>}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                );
            })}
        </div>
    );
};

export default SearchResults;
