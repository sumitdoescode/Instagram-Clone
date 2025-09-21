"use client";

import React, { useState, useEffect } from "react";
import Section from "@/components/Section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalSpinner from "@/components/GlobalSpinner";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { pusherClient } from "@/lib/pusher-client";
import { Button } from "@/components/ui/button";

// page to show all conversations
const ChatsPage = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await axios.get("/api/conversation");
                if (data.success) {
                    setChats(data.conversations);
                    if (data.conversations.length) {
                        setCurrentUserId(data.conversations[0].currentUserId);
                    }
                }
            } catch (error) {
                console.log(error);
                toast.error("Error fetching conversations");
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // ✅ Realtime updates for unread count
    useEffect(() => {
        const channel = pusherClient.subscribe(`user-${currentUserId}`);

        // when new message arrives → increase unread count
        channel.bind("new-message", ({ conversationId }) => {
            setChats((prev) => prev.map((chat) => (chat._id === conversationId ? { ...chat, unreadMessages: chat.unreadMessages + 1 } : chat)));
        });

        // when messages marked as read → reset unread count
        // channel.bind("unread-updated", ({ conversationId, unreadMessages }) => {
        //   setChats((prev) =>
        //     prev.map((chat) =>
        //       chat._id === conversationId
        //         ? { ...chat, unreadMessages }
        //         : chat
        //     )
        //   );
        // });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [currentUserId]);

    if (loading) {
        return <GlobalSpinner />;
    }

    if (!chats?.length) {
        return (
            <Section>
                <div className="mt-30 text-center">
                    {/* <Image src="/not-found.png" alt="Post not found" width={300} height={300} /> */}
                    <h1 className="text-5xl text-white font-bold tracking-tight">No Chats Yet</h1>
                    <p className="text-gray-400 text-base mt-1">Visit others profile to start chatting with them</p>
                    <Button onClick={() => router.push("/")} className={"mt-7"} size={"lg"}>
                        Go to Home
                    </Button>
                </div>
            </Section>
        );
    }
    return (
        <Section>
            <div>
                <Card className={"p-3 gap-3"}>
                    <CardHeader className={"p-0 flex items-center justify-between"}>
                        <CardTitle className={"text-3xl"}>Chats</CardTitle>
                        <Badge className="h-6 min-w-6 rounded-full px-1 tabular-nums text-base">{chats?.length}</Badge>
                        {/* <Badge>{chats?.length}</Badge> */}
                    </CardHeader>
                    {chats?.map(({ _id, participant, lastMessage, unreadMessages, updatedAt }) => {
                        // here id is the conversation/chat id
                        // participant = _id, username, email, profileImage -> url, here _id is the user id
                        return (
                            <CardContent onClick={() => router.push(`/chat/${participant._id}`)} key={_id} className="cursor-pointer bg-neutral-950 transition-all p-3 rounded-md">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${_id}`)}>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={participant.profileImage.url} alt={participant.username} className={"object-cover"} />
                                        <AvatarFallback>{participant.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle className="font-medium">{participant.username}</CardTitle>
                                            <p className="text-muted-foreground text-sm -mt-1">{`${lastMessage?.slice(0, 40)}...`}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-muted-foreground font-medium mt-0 text-sm text-right"> {updatedAt ? dayjs(updatedAt).format("HH:mm") : ""}</p>
                                            {unreadMessages > 0 && <Badge className="h-6 min-w-6 rounded-full px-1 font-mono tabular-nums text-right">{unreadMessages}</Badge>}
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

export default ChatsPage;
