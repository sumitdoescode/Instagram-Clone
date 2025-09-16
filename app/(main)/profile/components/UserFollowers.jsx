"use client";

import React, { useState, useEffect } from "react";
import UserFollowUnfollowCard from "../../components/UserFollowUnfollowCard";
import GlobalSpinner from "@/components/GlobalSpinner";
import { toast } from "sonner";
import axios from "axios";

const UserFollowers = ({ _id }) => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const { data } = await axios.get(`/api/user/${_id}/followers`);
                if (data.success) {
                    setFollowers(data.followers);
                }
            } catch (error) {
                console.log(error);
                toast.error("Error fetching followers");
            } finally {
                setLoading(false);
            }
        };
        fetchFollowers();
    }, [_id]);

    if (loading) return <GlobalSpinner />;

    if (!followers?.length)
        return (
            <div className="mt-10 flex items-center justify-center w-full">
                <h1 className="text-lg text-center">There are no followers yet.. 😔</h1>
            </div>
        );

    return (
        <div className="w-full flex items-center justify-center mt-10">
            <div className="flex flex-col items-center gap-6 w-full">
                {followers.map((follower) => {
                    return <UserFollowUnfollowCard key={follower._id} {...follower} />;
                })}
            </div>
        </div>
    );
};

export default UserFollowers;
