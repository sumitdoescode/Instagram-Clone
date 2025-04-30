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
    const { getToken, currentUser } = useAuth();

    const followFetcher = async (url, { arg: token }) => {
        const res = await fetchWithToken(url, token);
        return res;
    };

    const { trigger, isMutating } = useSWRMutation(`/user/followOrUnfollow/${_id}`, followFetcher);

    const followOrUnfollow = async () => {
        const token = await getToken({ template: "default" });
        const res = await trigger(token);
        // const res = await fetchWithToken(`/user/followOrUnfollow/${_id}`, token);
        console.log(res);
        if (res.success) {
            setFollowing(res.isFollow);
            if (res.isFollow) {
                toast("User followed successfully");
            } else {
                toast("User unfollowed successfully");
            }
        } else {
            toast("Error following user");
        }
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                    router.push(`/profile/${_id}`);
                }}
            >
                <Avatar className="w-8 h-8">
                    <AvatarImage src={profileImage} alt={`${username} profileImage`} />
                    <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="">
                    <p className="text-sm font-semibold">{username}</p>
                    <p className="text-sm text-gray-400">
                        {followersCount} {followersCount === 1 ? "follower" : "followers"}
                    </p>
                </div>
            </div>
            {!isOwnProfile && (
                <Button size={"sm"} className="cursor-pointer" variant={"outline"} onClick={followOrUnfollow} disabled={isMutating}>
                    {isMutating ? "Loading..." : following ? "Unfollow" : "Follow"}
                </Button>
            )}
        </div>
    );
};

export default UserFollowUnfollowCard;
