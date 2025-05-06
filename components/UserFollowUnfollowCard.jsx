"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fetchWithToken } from "@/utils/fetcher";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";

const UserFollowUnfollowCard = ({ _id, username, profileImage, gender, followersCount, isFollowing = false, isOwnProfile }) => {
    const [following, setFollowing] = useState(isFollowing);
    const router = useRouter();
    const { getToken } = useAuth();

    const followFetcher = async (url, { arg: token }) => {
        return await fetchWithToken(url, token); // returns { data, error }
    };

    const { trigger, isMutating } = useSWRMutation(`/user/followOrUnfollow/${_id}`, followFetcher);

    const followOrUnfollow = async () => {
        const token = await getToken();
        const { data, error } = await trigger(token);

        if (error || !data?.success) {
            toast("Error following user");
            return;
        }

        setFollowing(data.isFollow);
        toast(data.isFollow ? "User followed successfully" : "User unfollowed successfully");
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                <Avatar className="w-8 h-8">
                    <AvatarImage src={profileImage.url} alt={`${username} profileImage`} />
                    <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">{username}</p>
                    <p className="text-sm text-gray-400">
                        {followersCount} {followersCount === 1 ? "follower" : "followers"}
                    </p>
                </div>
            </div>
            {!isOwnProfile && (
                <Button size="sm" className="cursor-pointer" variant="outline" onClick={followOrUnfollow} disabled={isMutating}>
                    {isMutating ? "Loading..." : following ? "Unfollow" : "Follow"}
                </Button>
            )}
        </div>
    );
};

export default UserFollowUnfollowCard;
