"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import PostCard from "../../components/PostCard";
import { fetchWithToken } from "@/utils/fetcher";
import GlobalSpinner from "@/components/GlobalSpinner";

const FeedPosts = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken({ template: "default" });
        console.log(token);
        const { data, error } = await fetchWithToken("/post", token);
        if (error) throw new Error("Failed to fetch posts");
        return data;
    };

    const { data, error, isLoading } = useSWR("/post", fetcher);

    if (isLoading) return <GlobalSpinner />;

    if (error) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">❌ Something went wrong while loading posts.</div>
            </div>
        );
    }

    if (!data?.posts?.length) {
        return <h1 className="text-3xl text-center">There are no posts yet. 😔</h1>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {data.posts.map((post) => (
                <PostCard key={post._id} {...post} />
            ))}
        </div>
    );
};

export default FeedPosts;
