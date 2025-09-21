"use client";

import React from "react";
import Section from "@/components/Section";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DeleteChat from "../components/DeleteChat";
import { pusherClient } from "@/lib/pusher-client";
import { SendHorizontal } from "lucide-react";
// import NotFound from "@/app/not-found";

// page to show conversation with user
const page = () => {
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversationId, setConversationId] = useState(null);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { userId } = useParams();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`/api/message/user/${userId}`);
                if (data.success) {
                    setUser(data.user);
                    setMessages(data.messages);
                    if (data.messages.length) {
                        setConversationId(data.messages[0].conversationId);
                    }
                    // console.log(data);
                }
            } catch (error) {
                console.log(error);
                setIsError(true);
                setErrorMessage(error.response.data.message);
                toast.error("Error fetching user messages");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [userId]);

    useEffect(() => {
        if (!conversationId) return;

        const channel = pusherClient.subscribe(`conversation-${conversationId}`);

        const markAsRead = async () => {
            try {
                const { data } = await axios.patch(`/api/conversation/${conversationId}`);
                if (data.success) {
                    // toast("Conversation marked as read");
                }
            } catch (error) {
                console.log(error);
                toast("Error marking conversation as read");
            }
        };

        channel.bind("new-message", (newMessage) => {
            // console.log("📩 Realtime message:", newMessage);
            setMessages((prev) => [...prev, newMessage]);

            // Only mark as read if the message was sent by the other user
            if (String(newMessage.senderId) === String(userId)) {
                markAsRead();
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [conversationId]);

    const bottomRef = useRef(null);
    // Scroll to bottom when messages load or message is sent
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // triggers when messages update

    const sendMessage = async () => {
        try {
            setSending(true);
            const { data } = await axios.post(`/api/message/user/${userId}`, { content: content.trim() });
            if (data.success) {
                // toast("Message sent successfully");
                setContent("");
            }
        } catch (error) {
            console.log(error);
            toast("Error sending message");
        } finally {
            setSending(false);
        }
    };

    if (isError) {
        return (
            <Section>
                <Card className={`p-2 sticky top-10 z-10 shadow-2xl`}>
                    <CardHeader className={"p-0 flex items-center justify-between"}>
                        <h1 className="text-xl font-medium text-center">{errorMessage}</h1>
                    </CardHeader>
                </Card>
            </Section>
        );
    }

    if (loading) {
        return <GlobalSpinner />;
    }

    if (!user) {
        return null;
    }

    return (
        <Section>
            <div className="flex flex-col gap-2 min-h-[90vh]">
                <Card className={`p-2 sticky top-10 z-10 shadow-2xl`}>
                    <CardHeader className={"p-0 flex items-center justify-between"}>
                        <Link className="flex items-center gap-3 cursor-pointer" href={`/profile/${userId}`}>
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user?.profileImage?.url} alt={user?.username} className={"object-cover"} />
                                <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col w-full">
                                <CardTitle className="font-medium">{user?.username}</CardTitle>
                                <p className="text-sm text-neutral-300">{user?.gender}</p>
                            </div>
                        </Link>
                        {conversationId && <DeleteChat conversationId={conversationId} />}
                    </CardHeader>
                </Card>

                <Card className={"p-2 grow-1"}>
                    <CardHeader className={"text-center py-8"}>
                        <Avatar className="w-24 h-24 mx-auto">
                            <AvatarImage src={user?.profileImage?.url} alt={user?.username} className={"object-cover"} />
                            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-xl font-medium text-center">{user?.username}</h1>
                        <Link href={`/profile/${user._id}`}>
                            <Button size={"sm"} variant={"outline"} className="cursor-pointer">
                                View Profile
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className={`p-0 relative z-0`}>
                        <div className="flex flex-col gap-3">
                            {messages &&
                                messages.map(({ _id, message, content, senderId, receiverId, createdAt }) => {
                                    return (
                                        <div key={_id} className={`max-w-md border rounded-lg px-2 py-0 tracking-tight ${userId === senderId ? "bg-blue-200 self-start" : "bg-green-200 self-end"}`}>
                                            <p className="text-base text-black font-medium leading-tight">{message || content}</p>
                                            <p className="text-neutral-700 font-medium mt-0 text-xs text-right"> {createdAt ? dayjs(createdAt).format("HH:mm") : ""}</p>
                                        </div>
                                    );
                                })}
                            {/* 👇 Invisible ref div at the bottom */}
                            <div ref={bottomRef} />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`p-1 sticky bottom-0 z-40 shadow-2xl`}>
                    <CardFooter className="flex items-center justify-center gap-2 w-full p-1">
                        <Textarea placeholder="Type your message here." className={`resize-none h-[40px]`} value={content} onChange={(e) => setContent(e.target.value)} />
                        <Button variant="" className="cursor-pointer min-h-full" onClick={sendMessage} disabled={!content.trim() || sending}>
                            <SendHorizontal size={26} />
                            {/* <span>{sending ? "Sending..." : "Send"}</span> */}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Section>
    );
};

export default page;
