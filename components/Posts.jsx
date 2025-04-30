"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Post from "./Post";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";

const Posts = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken("/post", token);
    };

    const { data, error, isLoading } = useSWR("/post", fetcher);

    if (isLoading) return <h1 className="text-3xl">Loading...</h1>;
    if (error) return <h1 className="text-xl">❌ Error fetching posts</h1>;
    if (!data.posts.length) return <h1 className="text-xl">No posts found</h1>;

    return (
        <div className="flex flex-col gap-4 w-full">
            {data.posts.map((post, index) => {
                return <Post key={index} {...post} />;
            })}
        </div>
    );
};

export default Posts;
