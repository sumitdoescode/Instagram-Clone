import React from "react";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import UserPost from "./UserPost";

const UserPosts = ({ _id }) => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/post/user/${_id}`, token);
        if (error || !data.success) {
            throw new Error(error);
        }
        return data;
    };

    const { data, error, isLoading } = useSWR("/post", fetcher);

    if (error) return <h1 className="text-lg mt-10">❌ Error fetching posts</h1>;
    if (!data.posts.length) return <h1 className="text-lg mt-10">User has no posts yet.</h1>;

    return (
        <div className="mt-4 flex items-center justify-center w-full">
            <div className="flex flex-col gap-6 w-full">
                {data.posts.map((post) => {
                    return <UserPost key={post._id} {...post} />;
                })}
            </div>
        </div>
    );
};

export default UserPosts;
