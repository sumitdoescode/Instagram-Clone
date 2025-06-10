"use client";

import React from "react";
import Section from "@/components/Section";
import { fetchWithToken } from "@/utils/fetcher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import UserFollowUnfollowCard from "../components/UserFollowUnfollowCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalSpinner from "@/components/GlobalSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Badge } from "@/components/ui/badge";
import DeleteConversation from "./components/DeleteConversation";

// page to show all conversations
const ConversationsPage = () => {
    dayjs.extend(relativeTime);
    const { getToken } = useAuth();
    const router = useRouter();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/conversation", token);
        console.log(data);
        if (error) throw new Error("Failed to fetch conversations");
        return data;
    };

    const { data, error, isLoading } = useSWR("/conversation", fetcher);

    if (isLoading) {
        return <GlobalSpinner />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">❌ Something went wrong while loading conversations..</div>
            </div>
        );
    }

    if (!data?.conversations?.length) {
        return <h1 className="text-3xl text-center">There are no messages yet. 😔</h1>;
    }
    return (
        <Section>
            <div>
                <Card className={"p-2"}>
                    <CardHeader className={"p-0"}>
                        <CardTitle className={"text-3xl"}>Conversations ({data?.conversations?.length})</CardTitle>
                    </CardHeader>
                    {data?.conversations?.map(({ _id, participant, lastMessage, unreadMessages, updatedAt }) => {
                        // here id is the conversation id
                        // participant = _id, username, email, profileImage -> url, here _id is the user id
                        return (
                            <CardContent onClick={() => router.push(`/conversations/${participant._id}`)} key={_id} className="cursor-pointer hover:bg-neutral-800 transition-all p-2 rounded-md">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={participant.profileImage.url} alt={participant.username} />
                                        <AvatarFallback>{participant.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle className="font-medium">{participant.username}</CardTitle>
                                            <p className="text-muted-foreground text-sm">{`${lastMessage?.slice(0, 40)}...`}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="flex flex-col gap-0">
                                                <p className="text-muted-foreground text-sm">{dayjs(updatedAt).fromNow()}</p>
                                                <div className="flex items-center justify-between w-full">{unreadMessages > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums">{unreadMessages}</Badge>}</div>
                                            </div>
                                            <DeleteConversation />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        );
                    })}
                </Card>
            </div>
        </Section>
    );
};

export default ConversationsPage;
