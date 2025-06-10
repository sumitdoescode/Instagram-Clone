"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Section from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import UserPosts from "../components/UserPosts";
import UserFollowers from "../components/UserFollowers";
import UserFollowing from "../components/UserFollowing";
import { useRouter } from "next/navigation";
import GlobalSpinner from "@/components/GlobalSpinner";
import Link from "next/link";

// page to show user profile by id
export default function ProfilePage() {
    const { id } = useParams(); // this is the user id
    const { getToken } = useAuth();
    const router = useRouter();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/user/${id}`, token);
        if (error) throw new Error("Failed to fetch user profile");
        return data;
    };

    const { data, error, isLoading } = useSWR(`/user/${id}`, fetcher);

    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (data?.user?.isFollowing !== undefined) {
            setFollowing(data.user.isFollowing);
        }
    }, [data]);

    if (isLoading) return <GlobalSpinner />;
    if (error) return <div>failed to get user profile</div>;

    const { username, profileImage, gender, bio, email, postsCount, followersCount, followingCount, isFollowing, isAuthor } = data?.user;

    const handleToggleFollow = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/user/followOrUnfollow/${id}`, token);

        if (error || !data.success) {
            toast("Error following/unfollowing user");
            return;
        }
        if (data.success) {
            setFollowing(data.isFollow);
            if (data.isFollow) {
                toast("User followed successfully");
            } else {
                toast("User unfollowed successfully");
            }
        }
    };

    return (
        <Section>
            <Card>
                <CardHeader className="flex items-center justify-center">
                    <div className="text-center">
                        <Avatar className="w-50 h-50 m-auto">
                            <AvatarImage src={profileImage.url} alt="username profileImage" />
                            <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center mt-4">
                            {isAuthor && <Badge className="text-xs rounded-lg ml-auto">Author</Badge>}
                            <h4 className="scroll-m-20 text-xl font-medium mt-2">{username}</h4>
                            {gender && <p className="text-muted-foreground text-sm">{gender === "male" ? "he/him" : "she/her"}</p>}
                        </div>
                        <CardDescription>
                            <p className="[&:not(:first-child)]:mt-2 text-white">{email}</p>
                            <blockquote className="mt-6 border-l-2 pl-6 italic max-w-md">{bio}</blockquote>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {!isAuthor && (
                                    <Button className="cursor-pointer" onClick={handleToggleFollow}>
                                        {following ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                                <Link href={`/conversations/${id}`}>
                                    {/* here id is the user id */}
                                    <Button variant="outline" className="cursor-pointer">
                                        Conversation
                                    </Button>
                                </Link>
                            </div>
                            <div className="text-xl lg:text-2xl font-normal flex items-center justify-center gap-10 lg:gap-14 mt-10">
                                <div className="">
                                    <h2>{postsCount}</h2>
                                    <p className="text-neutral-400 text-lg">posts</p>
                                </div>
                                <div className="">
                                    <h2>{followersCount}</h2>
                                    <p className="text-neutral-400 text-lg">followers</p>
                                </div>
                                <div className="">
                                    <h2>{followingCount}</h2>
                                    <p className="text-neutral-400 text-lg ">following</p>
                                </div>
                            </div>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className={"mt-14 w-full flex items-center justify-center p-2"}>
                    <Tabs defaultValue="posts" className="w-full max-w-xl">
                        <TabsList className="">
                            <TabsTrigger className="text-sm" value="posts">
                                Posts
                            </TabsTrigger>
                            <TabsTrigger className="text-sm" value="followers">
                                Followers
                            </TabsTrigger>
                            <TabsTrigger className="text-sm" value="followings">
                                Followings
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts" className={""}>
                            <UserPosts _id={id} />
                        </TabsContent>
                        <TabsContent value="followers" className={""}>
                            <UserFollowers _id={id} />
                        </TabsContent>
                        <TabsContent value="followings" className={""}>
                            <UserFollowing _id={id} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </Section>
    );
}
