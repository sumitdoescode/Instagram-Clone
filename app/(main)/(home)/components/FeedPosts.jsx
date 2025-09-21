"use client";

import React, { useState, useEffect } from "react";
import PostCard from "../../components/PostCard";
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";
import { toast } from "sonner";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";

const FeedPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPosts = async () => {
            try {
                const { data } = await axios.get("/api/post");
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.log(error);
                toast("Error fetching posts");
            } finally {
                setLoading(false);
            }
        };
        getPosts();
    }, []);

    if (loading) return <GlobalSpinner />;

    if (!posts.length) {
        return (
            <Section>
                <div className="mt-30 text-center">
                    {/* <Image src="/not-found.png" alt="Post not found" width={300} height={300} /> */}
                    <h1 className="text-5xl text-white font-bold tracking-tight">No Posts Yet</h1>
                    <p className="text-gray-400 text-base mt-1">Create your first post to start and share your journey with the world.</p>
                    <Button onClick={() => router.push("/")} className={"mt-7"} size={"lg"}>
                        Create Post
                    </Button>
                </div>
            </Section>
        );
    }

    return <div className="flex flex-col gap-4 w-full">{posts && posts.map((post) => <PostCard key={post._id} {...post} />)}</div>;
};

export default FeedPosts;
