import React from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { fetchWithToken } from "@/utils/fetcher";
import UserFollowUnfollowCard from "./UserFollowUnfollowCard";

const UserFollowing = ({ _id }) => {
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/user/${_id}/following`, token);
        if (error || !data.success) {
            throw new Error(error);
        }
        return data;
    };

    const { data, error, isLoading } = useSWR(`/user/${_id}/following`, fetcher);

    if (isLoading) return null;
    if (error) return <h1 className="text-lg mt-10">❌ Error fetching followings</h1>;
    if (!data?.following?.length) return <h1 className="text-lg mt-10">There are no following yet..😔</h1>;

    return (
        <div className="w-full flex items-center justify-center mt-10">
            <div className="flex flex-col items-center gap-6 w-full">
                {data.following.map((followingEl) => {
                    return <UserFollowUnfollowCard key={followingEl._id} {...followingEl} />;
                })}
            </div>
        </div>
    );
};

export default UserFollowing;
