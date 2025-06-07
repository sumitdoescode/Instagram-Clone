import React from "react";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import Post from "../../components/PostCard";
import GlobalSpinner from "@/components/GlobalSpinner";

const UserBookmarks = () => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/user/bookmarks`, token);
        if (error || !data.success) {
            throw new Error(error);
        }
        return data;
    };

    const { data, error, isLoading } = useSWR("/user/bookmarks", fetcher);

    if (isLoading) return <GlobalSpinner />;
    if (error) return <h1 className="text-xl mt-10">❌ Error fetching posts</h1>;
    if (!data?.bookmarks?.length) return <h1 className="text-xl mt-10">There are no bookmarks yet..😔</h1>;

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
