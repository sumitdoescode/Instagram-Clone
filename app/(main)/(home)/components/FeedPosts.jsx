"use client";

import React, { useState, useEffect } from "react";
import PostCard from "../../components/PostCard";
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";
import { toast } from "sonner";

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
        return <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-10">There are no posts yet. 😔</h2>;
    }

    return <div className="flex flex-col gap-4 w-full">{posts && posts.map((post) => <PostCard key={post._id} {...post} />)}</div>;
};

export default FeedPosts;
