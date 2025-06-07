"use client";

import React from "react";
import Section from "@/components/Section";
import { fetchWithToken } from "@/utils/fetcher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import UserFollowUnfollowCard from "../components/UserFollowUnfollowCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalSpinner from "@/components/GlobalSpinner";

const Messagepage = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/conversation", token);
        if (error) throw new Error("Failed to fetch conversations");
        console.log(data);
        return data;
    };

    const { data, error, isLoading } = useSWR("/conversation", fetcher);

    if (isLoading) {
        return <GlobalSpinner />;

    if (error) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">❌ Something went wrong while loading conversations..</div>
            </div>
        );
    }

    // if (!data?.conversations?.length) {
    //     return <h1 className="text-3xl text-center">There are no messages yet. 😔</h1>;
    // }
    return (
        <Section>
            <div>
                <Card className={"p-2"}>
                    <CardHeader>
                        <CardTitle className={"text-3xl"}>Messages ({data?.conversations?.length})</CardTitle>
                    </CardHeader>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => {
                        return (
                            <CardContent>
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="" />
                                        <AvatarFallback>S</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <CardTitle className="font-medium">sumitdoescode</CardTitle>
                                        {/* {gender && <CardDescription className="text-sm">{gender === "male" ? "he/him" : "she/her"}</CardDescription>} */}
                                        <p>bro what's up, yeah it's been good here what about you?</p>
                                    </div>
                                </div>
                            </CardContent>
                        );
                    })}
                </Card>
            </div>
        </Section>
    );
};

export default Messagepage;
