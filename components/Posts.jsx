"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import Post from "./Post";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { Loader2 } from "lucide-react"; // Built-in icon lib
import { Skeleton } from "@/components/ui/skeleton";

const Posts = () => {
    const { getToken } = useAuth();

    // Define SWR fetcher for posts
    const fetcher = async (url) => {
        const token = await getToken();
        return fetchWithToken(url, token);
    };

    // Use SWR to fetch posts
    const { data, error, isLoading } = useSWR("/post", fetcher);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">❌ Something went wrong while loading posts.</div>
            </div>
        );
    }

    // Handle empty data
    if (!data?.posts?.length) {
        return <h1 className="text-xl text-center">No posts found</h1>;
    }

    // Render posts
    return (
        <div className="flex flex-col gap-4 w-full">
            {data.posts.map((post) => (
                <Post key={post._id} {...post} />
            ))}
        </div>
    );
};

export default Posts;
