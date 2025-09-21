"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

const UserFollowUnfollowCard = ({ _id, username, profileImage, gender, followersCount, isFollowing = false, isOwnProfile }) => {
    const [following, setFollowing] = useState(isFollowing);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    const followOrUnfollow = async () => {
        try {
            setUpdating(true);
            const { data } = await axios.get(`/api/user/followOrUnfollow/${_id}`);
            if (data.success) {
                setFollowing(data.isFollow);
            }
            toast(data.isFollow ? "User followed successfully" : "User unfollowed successfully");
        } catch (error) {
            console.log(error);
            toast("Error following user");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                <Avatar className="w-8 h-8">
                    <AvatarImage src={profileImage.url} alt={`${username} profileImage`} />
                    <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-base font-normal">{username}</p>
                    <p className="text-sm text-gray-400 -mt-1">
                        {followersCount} {followersCount === 1 ? "follower" : "followers"}
                    </p>
                </div>
            </div>
            {!isOwnProfile && (
                <Button size="sm" className="cursor-pointer" variant="outline" onClick={followOrUnfollow} disabled={updating}>
                    {updating ? "Loading..." : following ? "Unfollow" : "Follow"}
                </Button>
            )}
        </div>
    );
};

export default UserFollowUnfollowCard;
