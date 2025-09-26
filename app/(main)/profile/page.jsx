"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Section from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import UserPosts from "./components/UserPosts";
import UserFollowers from "./components/UserFollowers";
import UserFollowing from "./components/UserFollowing";
import UserBookmarks from "./components/UserBookmarks";
import { useRouter } from "next/navigation";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useUserContext } from "@/contexts/UserContextProvider";

export default function OwnProfilePage() {
    const { user, loading } = useUserContext();
    const router = useRouter();

    if (loading) return <GlobalSpinner />;

    const { _id, username, profileImage, gender, bio, email, postsCount, followersCount, followingCount } = user;
    return (
        <Section>
            <Card className="p-4 gap-0">
                <CardHeader className="flex items-center justify-center p-0">
                    <div className="text-center">
                        <Avatar className="w-50 h-50 m-auto">
                            <AvatarImage src={profileImage.url} className={"object-cover"} alt="username profileImage" />
                            <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center mt-4">
                            <div className="text-center mt-4">
                                {<Badge className="text-xs rounded-lg ml-auto">Owner</Badge>}
                                <h4 className="scroll-m-20 text-xl font-medium mt-2">{username}</h4>
                                {gender && <p className="text-muted-foreground text-sm">{gender === "male" ? "he/him" : "she/her"}</p>}
                            </div>
                        </div>
                        <CardDescription>
                            <p className="[&:not(:first-child)]:mt-2 text-white">{email}</p>
                            <blockquote className="mt-6 border-l-2 pl-6 italic max-w-md">{bio}</blockquote>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {/* as you can't send message to yourself, so commented it out */}
                                {/* <Button variant="outline" className="cursor-pointer" onClick={() => router.push(`/chat`)}>
                                    Chat
                                </Button> */}
                                <Button variant="outline" className="cursor-pointer" onClick={() => router.push(`/profile/edit`)}>
                                    Edit Profile
                                </Button>
                            </div>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className={"w-full p-0 max-w-md mx-auto"}>
                    <div className="text-xl font-normal flex gap-4 mt-10 text-primary w-full">
                        <div className="bg-neutral-950 rounded-xl p-4 flex flex-col items-center justify-center gap-0 grow-1">
                            <h2>{postsCount}</h2>
                            <p className="text-neutral-400 text-base">posts</p>
                        </div>
                        <div className="bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center gap-0 grow-1">
                            <h2>{followersCount}</h2>
                            <p className="text-neutral-400 text-base">followers</p>
                        </div>
                        <div className="bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center gap-0 grow-1">
                            <h2>{followingCount}</h2>
                            <p className="text-neutral-400 text-base">following</p>
                        </div>
                    </div>
                    <Tabs defaultValue="posts" className="w-full max-w-lg md:max-w-xl mt-12">
                        <TabsList className="w-full bg-neutral-950">
                            {/* <TabsList className="sticky top-12 z-50 w-full flex justify-around bg-neutral-950 border-b rounded-none"> */}
                            <TabsTrigger className="text-sm" value="posts">
                                Posts
                            </TabsTrigger>
                            <TabsTrigger className="text-sm" value="followers">
                                Followers
                            </TabsTrigger>
                            <TabsTrigger className="text-sm" value="followings">
                                Followings
                            </TabsTrigger>
                            <TabsTrigger className="text-sm" value="bookmarks">
                                Bookmarks
                            </TabsTrigger>
                        </TabsList>
                        {/* 👇 Add margin/padding so content starts lower */}
                        <div className="mt-4">
                            <TabsContent value="posts">
                                <UserPosts _id={_id} isOwner={true} />
                            </TabsContent>
                            <TabsContent value="followers">
                                <UserFollowers _id={_id} />
                            </TabsContent>
                            <TabsContent value="followings">
                                <UserFollowing _id={_id} />
                            </TabsContent>
                            <TabsContent value="bookmarks">
                                <UserBookmarks />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </Section>
    );
}
