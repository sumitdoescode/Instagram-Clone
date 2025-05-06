"use client";
import React from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { fetchWithToken } from "@/utils/fetcher";
import UserFollowUnfollowCard from "./UserFollowUnfollowCard";

const RecommendedUsers = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/user/recommended", token);
        if (error) throw new Error("Failed to fetch recommended users");
        return data;
    };

    const { data, error, isLoading } = useSWR("/user/recommended", fetcher);

    //   if (isLoading) return <p className="text-base mt-5">Loading...</p>;
    if (error) return <p className="text-base mt-5 text-red-500">❌ Error fetching recommended users</p>;
    if (!data?.users?.length) return <p className="text-base mt-5">No recommended users found</p>;

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-6">
                {data.users.map((user) => (
                    <UserFollowUnfollowCard key={user._id} {...user} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedUsers;
