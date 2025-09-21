"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard from "../../components/PostCard";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import Comments from "./components/Comments";
import UpdatePost from "./components/UpdatePost";
import DeletePost from "./components/DeletePost";
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";

const Page = () => {
    const [post, setPost] = useState({});
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await axios.get(`/api/post/${id}`);
                if (data.success) {
                    setPost(data.post);
                }
            } catch (error) {
                if (error.response.status === 404) {
                    setNotFound(true);
                    return;
                }
                console.log(error);
                toast.error("Error fetching post");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, []);

    if (loading) {
        return <GlobalSpinner />;
    }

    if (notFound) {
        return (
            <Section className={"w-full "}>
                <div className="mt-30 text-center">
                    {/* <Image src="/not-found.png" alt="Post not found" width={300} height={300} /> */}
                    <h1 className="text-5xl text-white font-bold tracking-tight">Post Not Found</h1>
                    <p className="text-gray-400 text-base mt-1">The post you're looking for doesn't exist or was removed.</p>
                    <Button onClick={() => router.push("/")} className={"mt-7"} size={"lg"}>
                        Go to Home
                    </Button>
                </div>
            </Section>
        );
    }

    return (
        <Section>
            <div className="w-full flex flex-col items-center lg:flex-row lg:items-start lg:justify-between gap-16">
                <div className="max-w-lg w-full">
                    <div className="w-full">
                        <PostCard {...post} fromRendered="postDetailsPage" />
                    </div>
                    <h4 className="scroll-m-20 text-xl font-medium mt-5">{post.caption}</h4>
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
