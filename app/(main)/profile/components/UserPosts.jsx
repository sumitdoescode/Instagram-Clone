import React, { useState, useEffect } from "react";
import UserPost from "./UserPost";
import GlobalSpinner from "@/components/GlobalSpinner";
import { toast } from "sonner";
import axios from "axios";

const UserPosts = ({ _id }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(`/api/post/user/${_id}`);
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching posts");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <GlobalSpinner />;

    if (!posts?.length) return <h1 className="text-lg mt-10">There are no posts yet..😔</h1>;

    return (
        <div className="mt-4 flex items-center justify-center w-full">
            <div className="flex flex-col gap-6 w-full">
                {posts &&
                    posts.map((post) => {
                        return <UserPost key={post._id} {...post} />;
                    })}
            </div>
        </div>
    );
};

export default UserPosts;
