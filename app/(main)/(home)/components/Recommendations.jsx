"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GlobalSpinner from "@/components/GlobalSpinner";
import UserFollowUnfollowCard from "../../components/UserFollowUnfollowCard";
import axios from "axios";

const Recommendations = () => {
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getRecommendedUsers = async () => {
            try {
                const { data } = await axios.get("/api/user/recommended");
                if (data.success) {
                    setRecommendedUsers(data.recommendedUsers);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getRecommendedUsers();
    }, []);

    if (loading) return <GlobalSpinner />;
    if (!recommendedUsers.length) return null;
    return (
        <Card className="w-full max-w-md p-3 lg:sticky lg:top-12">
            <CardHeader className="p-0">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">You might want to know them</h4>
            </CardHeader>
            <CardContent className="mt-5 p-0">
                <div className="w-full">
                    <div className="flex flex-col items-center gap-6">{recommendedUsers && recommendedUsers.map((user) => <UserFollowUnfollowCard key={user._id} {...user} />)}</div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Recommendations;
