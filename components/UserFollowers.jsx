import React from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import UserFollowUnfollowCard from "./UserFollowUnfollowCard";

const UserFollowers = ({ _id }) => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/user/${_id}/followers`, token);
    };

    const { data, error, isLoading } = useSWR(`/user/${_id}/followers`, fetcher);

    if (isLoading) return <h1 className="text-lg mt-10">Loading...</h1>;
    if (error) return <h1 className="text-lg mt-10">❌ Error fetching followers</h1>;
    if (!data.followers.length) return <h1 className="text-lg mt-10">No followers yet</h1>;

    return (
        <div className="w-full flex items-center justify-center mt-10">
            <div className="flex flex-col items-center gap-6 w-full">
                {data.followers.map((follower) => {
                    return <UserFollowUnfollowCard key={follower._id} {...follower} />;
                })}
            </div>
        </div>
    );
};

export default UserFollowers;
