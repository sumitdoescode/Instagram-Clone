"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { fetchWithToken } from "@/utils/fetcher";
import GlobalSpinner from "@/components/GlobalSpinner";
import UserFollowUnfollowCard from "../../components/UserFollowUnfollowCard";

const Recommendations = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/user/recommended", token);
        if (error) throw new Error("Failed to fetch recommended users");
        return data;
    };

    const { data, error, isLoading } = useSWR("/user/recommended", fetcher);

    if (isLoading) return <GlobalSpinner />;

    // if there are no recommended users simple do not show then
    if (!data?.users?.length) return null;
    return (
        <Card className="w-full max-w-md py-5 lg:sticky lg:top-12">
            <CardHeader className="px-3">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">You might want to know them</h4>
            </CardHeader>
            <CardContent className="mt-5 px-3">
                <div className="w-full">
                    <div className="flex flex-col items-center gap-6">
                        {data?.users?.map((user) => (
                            <UserFollowUnfollowCard key={user._id} {...user} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Recommendations;
