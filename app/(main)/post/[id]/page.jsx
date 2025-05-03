"use client";
import React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import Post from "@/components/Post";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import Comments from "@/components/Comments";

import DeletePost from "@/components/DeletePost";
import UpdatePost from "@/components/UpdatePost";

const page = () => {
    const { id } = useParams();
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/post/${id}`, token);
    };
    const { data, error, isLoading } = useSWR(`/post/${id}`, fetcher);

    if (isLoading) return <h1 className="text-3xl text-white mt-5">Loading...</h1>;
    if (error)
        return (
            <div className="mt-10">
                <h1 className="text-5xl text-white mb-4">{error.response.data.message}</h1>
                <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
        );
    return (
        <Section>
            <div className="w-full flex flex-col items-center lg:flex-row lg:items-start lg:justify-between gap-16">
                <div className="max-w-lg w-full">
                    <div className="w-full">
                        <Post {...data.post} fromRendered={"postDetailsPage"} />
                    </div>
                    <h1 className="text-xl mt-6">{data.post.caption}</h1>
                    {data.post.isAuthor && (
                        <div className="flex items-center gap-4 mt-8">
                            {/* <UpdatePost postId={id} caption={data.post.caption} image={data.post.image} /> */}
                            <UpdatePost {...data.post} />
                            <DeletePost postId={id} />
                        </div>
                    )}
                </div>
                <div className="max-w-md w-full">
                    <Comments postId={id} />
                </div>
            </div>
        </Section>
    );
};

export default page;
