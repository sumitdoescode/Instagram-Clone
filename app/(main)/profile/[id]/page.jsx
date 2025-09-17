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

// page to show user profile by id
export default function ProfilePage() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [following, setFollowing] = useState(false);
    const { id } = useParams(); // this is the user id

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
                console.log(error);
                toast.error("Error fetching user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <GlobalSpinner />;

    const { username, profileImage, gender, bio, email, postsCount, followersCount, followingCount, isAuthor } = user;

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
                            {isAuthor && <Badge className="text-xs rounded-lg ml-auto">Author</Badge>}
                            <h4 className="scroll-m-20 text-xl font-medium mt-2">{username}</h4>
                            {gender && <p className="text-muted-foreground text-sm">{gender === "male" ? "he/him" : "she/her"}</p>}
                        </div>
                        <CardDescription>
                            <p className="[&:not(:first-child)]:mt-2 text-white">{email}</p>
                            <blockquote className="mt-6 border-l-2 pl-6 italic max-w-md">{bio}</blockquote>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {!isAuthor && (
                                    <Button className="cursor-pointer" onClick={toggleFollow} disabled={toggling}>
                                        {toggling ? "Loading..." : following ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                                {/* as you can't send message to yourself, so commented it out */}
                                {/* <Link href={`/chat/${id}`} className="disabled">
                                    <Button variant="outline" className="cursor-pointer disabled:cursor-not-allowed">
                                        Chat
                                    </Button>
                                </Link> */}
                            </div>
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
}
