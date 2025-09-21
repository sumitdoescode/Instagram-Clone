"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";
import Link from "next/link";

// page to show user profile by id
const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [following, setFollowing] = useState(false);
    const { id } = useParams(); // this is the user id
    const [notFound, setNotFound] = useState(false);

    // const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get(`/api/user/${id}`);
                if (data.success) {
                    setUser(data.user);
                    setFollowing(data.user.isFollowing);
                }
            } catch (error) {
                if (error.response.status === 404) {
                    setNotFound(true);
                    return;
                }
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <GlobalSpinner />;

    if (notFound) {
        return (
            <Section className={"w-full "}>
                <div className="mt-30 text-center">
                    {/* <Image src="/not-found.png" alt="Post not found" width={300} height={300} /> */}
                    <h1 className="text-5xl text-white font-bold tracking-tight">User Not Found</h1>
                    <p className="text-gray-400 text-base mt-1">The User you're looking for doesn't exist or was deleted.</p>
                    <Button onClick={() => router.push("/")} className={"mt-7"} size={"lg"}>
                        Go to Home
                    </Button>
                </div>
            </Section>
        );
    }

    const { username, profileImage, gender, bio, email, postsCount, followersCount, followingCount, isOwner } = user;

    const toggleFollow = async () => {
        try {
            setToggling(true);
            const { data } = await axios.get(`/api/user/followOrUnfollow/${id}`);
            if (data.success) {
                setFollowing(data.isFollow);
            }
            toast(data.isFollow ? "User followed successfully" : "User unfollowed successfully");
        } catch (error) {
            console.log(error);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Section>
            <Card className={"p-4 gap-0"}>
                <CardHeader className="flex items-center justify-center p-0">
                    <div className="text-center">
                        <Avatar className="w-50 h-50 m-auto">
                            <AvatarImage src={profileImage?.url} alt={`${username} profile`} className={"object-cover"} />
                            <AvatarFallback className="rounded-lg">{username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>

                        <div className="text-center mt-4">
                            {isOwner && <Badge className="text-xs rounded-lg ml-auto">Owner</Badge>}
                            <h4 className="scroll-m-20 text-xl font-medium mt-2">{username}</h4>
                            {gender && <p className="text-muted-foreground text-sm">{gender === "male" ? "he/him" : "she/her"}</p>}
                        </div>
                        <CardDescription>
                            <p className="[&:not(:first-child)]:mt-2 text-white">{email}</p>
                            <blockquote className="mt-6 border-l-2 pl-6 italic max-w-md">{bio}</blockquote>

                            {/* if your are not the owner, you can toggle follow/unfollow and chat */}
                            {!isOwner && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <Button className="cursor-pointer" onClick={toggleFollow} disabled={toggling}>
                                        {toggling ? "Loading..." : following ? "Unfollow" : "Follow"}
                                    </Button>

                                    <Link href={`/chat/${id}`}>
                                        <Button variant="outline" className="cursor-pointer disabled:cursor-not-allowed">
                                            Chat
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className={"w-full p-0 max-w-md mx-auto"}>
                    <div className="text-xl font-normal flex gap-4 mt-10 text-primary w-full">
                        <div className="bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center grow-1">
                            <h2>{postsCount}</h2>
                            <p className="text-neutral-400 text-base">posts</p>
                        </div>
                        <div className="bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center grow-1">
                            <h2>{followersCount}</h2>
                            <p className="text-neutral-400 text-base">followers</p>
                        </div>
                        <div className="bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center grow-1">
                            <h2>{followingCount}</h2>
                            <p className="text-neutral-400 text-base">following</p>
                        </div>
                    </div>
                    <Tabs defaultValue="posts" className="w-full max-w-lg md:max-w-xl mt-12">
                        <TabsList className="w-full bg-neutral-950">
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
};

export default ProfilePage;
