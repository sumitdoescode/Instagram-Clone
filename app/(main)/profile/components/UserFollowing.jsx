import React, { useState, useEffect } from "react";
import UserFollowUnfollowCard from "../../components/UserFollowUnfollowCard";
import GlobalSpinner from "@/components/GlobalSpinner";
import { toast } from "sonner";
import axios from "axios";

const UserFollowing = ({ _id }) => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowings = async () => {
            try {
                const { data } = await axios.get(`/api/user/${_id}/following`);
                if (data.success) {
                    setFollowing(data.following);
                }
            } catch (error) {
                console.log(error);
                toast.error("Error fetching followings");
            } finally {
                setLoading(false);
            }
        };
        fetchFollowings();
    }, []);

    if (loading) return <GlobalSpinner />;

    if (!following?.length) return <h1 className="text-lg mt-10">There are no following yet..😔</h1>;

    return (
        <div className="w-full flex items-center justify-center mt-10">
            <div className="flex flex-col items-center gap-6 w-full">
                {following &&
                    following.map((followingEl) => {
                        return <UserFollowUnfollowCard key={followingEl._id} {...followingEl} />;
                    })}
            </div>
        </div>
    );
};

export default UserFollowing;
