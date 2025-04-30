"use client";
import React from "react";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { fetchWithToken } from "@/utils/fetcher";
import UserFollowUnfollowCard from "./UserFollowUnfollowCard";

const RecommenedUsers = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        // console.log(token);
        return await fetchWithToken("/user/recommended", token);
    };

    const { data, error, isLoading } = useSWR("/user/recommended", fetcher);
    // console.log(data);

    if (isLoading) return <h1 className="text-base">Loading...</h1>;
    if (error) return <h1 className="text-base">❌ Error fetching recommended users</h1>;
    if (!data.users.length) return <h1 className="text-base">No recommended users found</h1>;

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-6">
                {data.users.map((user) => {
                    return <UserFollowUnfollowCard key={user._id} {...user} />;
                })}
            </div>
        </div>
    );
};

export default RecommenedUsers;
