"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import PostCard from "../../components/PostCard";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import Comments from "./components/Comments";
import UpdatePost from "./components/UpdatePost";
import DeletePost from "./components/DeletePost";
import Image from "next/image";
import GlobalSpinner from "@/components/GlobalSpinner";

const Page = () => {
    const { id } = useParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/post/${id}`, token);
        if (error) throw new Error("Failed to fetch post details");
        return data;
    };

    const { data, error, isLoading } = useSWR(`/post/${id}`, fetcher);

    if (isLoading) {
        return <GlobalSpinner />;
    }

    if (error) {
        return (
            <div className="mt-10 flex flex-col items-center gap-6">
                <h1 className="text-4xl text-white font-semibold">Error loading post</h1>
                <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
        );
    }

    const post = data?.post;

    if (!post) {
        return (
            <div className="mt-10 flex flex-col items-center gap-6 text-center">
                {/* <Image src="/not-found.png" alt="Post not found" width={300} height={300} /> */}
                <h1 className="text-3xl text-white font-bold">Post Not Found</h1>
                <p className="text-gray-400">The post you're looking for doesn't exist or was removed.</p>
                <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
        );
    }

    return (
        <Section>
            <div className="w-full flex flex-col items-center lg:flex-row lg:items-start lg:justify-between gap-16">
                <div className="max-w-lg w-full">
                    <div className="w-full">
                        <PostCard {...post} fromRendered="postDetailsPage" />
                    </div>
                    <h1 className="text-xl mt-6">{post.caption}</h1>
                    {post.isAuthor && (
                        <div className="flex items-center gap-4 mt-8">
                            <UpdatePost {...post} />
                            <DeletePost {...post} />
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

export default Page;
