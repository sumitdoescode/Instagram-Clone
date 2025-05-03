"use client";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Section from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import UserPosts from "@/components/UserPosts";
import UserFollowers from "@/components/UserFollowers";
import UserFollowings from "@/components/UserFollowings";
import UserBookmarks from "@/components/UserBookmarks";
import { useRouter } from "next/navigation";

export default function OwnProfilePage() {
    const { getToken } = useAuth();
    const router = useRouter();

    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/user`, token);
    };

    const { data, error, isLoading } = useSWR(`/user`, fetcher);

    if (error) return <h1 className="text-xl">Failed to Get Own User Profile</h1>;
    if (isLoading) return <h1 className="text-xl">loading...</h1>;

    const { _id, username, profileImage, gender, bio, email, postsCount, followersCount, followingCount } = data.user;
    console.log(data);

    return (
        <Section>
            <Card className="">
                <CardHeader className="flex items-center justify-center">
                    <div className="text-center">
                        <Avatar className="w-50 h-50 m-auto">
                            <AvatarImage src={profileImage.url} alt="username profileImage" />
                            <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center mt-4">
                            <Badge className="text-xs rounded-lg ml-auto">Author</Badge>
                            {/* <p className="text-sm font-semibold">{data.user.username}</p> */}
                            <CardTitle className="text-lg mt-2">{username}</CardTitle>
                            {gender && <p className="text-md text-gray-500">{gender === "male" ? "he/him" : "she/her"}</p>}
                        </div>
                        <CardContent className="mt-2">{bio}</CardContent>
                        <p className="mt-1 text-md text-gray-300">{email}</p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button variant="outline" className="cursor-pointer" onClick={() => router.push(`/message`)}>
                                Message
                            </Button>
                            <Button variant="outline" className="cursor-pointer" onClick={() => router.push(`/profile/edit`)}>
                                Edit Profile
                            </Button>
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
                    </div>
                </CardHeader>
                <CardContent className={"mt-14 w-full flex items-center justify-center p-0"}>
                    <Tabs defaultValue="posts" className="w-full max-w-lg md:max-w-xl">
                        <TabsList className="">
                            <TabsTrigger className="text-xs sm:text-sm" value="posts">
                                Posts
                            </TabsTrigger>
                            <TabsTrigger className="text-xs sm:text-sm" value="followers">
                                Followers
                            </TabsTrigger>
                            <TabsTrigger className="text-xs sm:text-sm" value="followings">
                                Followings
                            </TabsTrigger>
                            <TabsTrigger className="text-xs sm:text-sm" value="bookmarks">
                                Bookmarks
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts">
                            <UserPosts _id={_id} />
                        </TabsContent>
                        <TabsContent value="followers" className={""}>
                            <UserFollowers _id={_id} />
                        </TabsContent>
                        <TabsContent value="followings" className={""}>
                            <UserFollowings _id={_id} />
                        </TabsContent>
                        <TabsContent value="bookmarks" className={""}>
                            <UserBookmarks />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </Section>
    );
}
