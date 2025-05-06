"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import Post from "./Post";
import { fetchWithToken } from "@/utils/fetcher";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Posts = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/post", token);
        if (error) throw new Error("Failed to fetch posts");
        return data;
    };

    const { data, error, isLoading } = useSWR("/post", fetcher);

    // if (isLoading) {
    //     return (
    //         <div className="flex flex-col gap-4 w-full">
    //             {Array.from({ length: 3 }).map((_, i) => (
    //                 <Skeleton key={i} className="h-40 w-full rounded-lg" />
    //             ))}
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">❌ Something went wrong while loading posts.</div>
            </div>
        );
    }

    if (!data?.posts?.length) {
        return <h1 className="text-xl text-center">No posts found</h1>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {data.posts.map((post) => (
                <Post key={post._id} {...post} />
            ))}
        </div>
    );
};

export default Posts;
