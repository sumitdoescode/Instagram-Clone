import React from "react";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import Post from "./Post";

const UserBookmarks = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/user/bookmarks`, token);
    };

    const { data, error, isLoading } = useSWR("/user/bookmarks", fetcher);

    if (isLoading) return <h1 className="text-xl mt-10">Loading...</h1>;
    if (error) return <h1 className="text-xl mt-10">❌ Error fetching posts</h1>;
    if (!data.bookmarks.length) return <h1 className="text-xl mt-10">User has no posts yet.</h1>;

    return (
        <div className="mt-10 flex items-center justify-center w-full">
            <div className="flex flex-col gap-6 w-full">
                {data.bookmarks.map((bookmark) => {
                    return <Post key={bookmark._id} {...bookmark} />;
                })}
            </div>
        </div>
    );
};

export default UserBookmarks;
