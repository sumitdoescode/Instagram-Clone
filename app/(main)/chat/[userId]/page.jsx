"use client";

import React, { useState, useRef, useEffect } from "react";
import Section from "@/components/Section";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import axios from "axios";
import DeleteChat from "../components/DeleteChat";
import { pusherClient } from "@/lib/pusher-client";
import { SendHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

function getDateLabel(date) {
    const d = dayjs(date);
    if (d.isToday()) return "Today";
    if (d.isYesterday()) return "Yesterday";
    return d.format("DD MMM YYYY");
}

const Page = () => {
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversationId, setConversationId] = useState(null);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { userId } = useParams();
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    const router = useRouter();

    // Fetch messages
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
                }
            } catch (error) {
                console.log(error);
                setIsError(true);
                setErrorMessage(error.response?.data?.message || "Error fetching messages");
                toast.error("Error fetching user messages");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [userId]);

    // Pusher subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = pusherClient.subscribe(`conversation-${conversationId}`);

        const markAsRead = async () => {
            try {
                await axios.patch(`/api/conversation/${conversationId}`);
            } catch (error) {
                console.log(error);
                toast("Error marking conversation as read");
            }
        };

        channel.bind("new-message", (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
            if (String(newMessage.senderId) === String(userId)) {
                markAsRead();
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [conversationId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Send message
    const sendMessage = async () => {
        try {
            setSending(true);
            const { data } = await axios.post(`/api/message/user/${userId}`, {
                content: content.trim(),
            });
            if (data.success) {
                setContent("");
                if (textareaRef.current) {
                    textareaRef.current.style.height = "40px"; // reset after send
                }
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
                <Card className="p-2 sticky top-10 z-10 shadow-2xl">
                    <CardHeader className="p-0 flex items-center justify-between">
                        <h1 className="text-xl font-medium text-center">{errorMessage}</h1>
                    </CardHeader>
                </Card>
            </Section>
        );
    }

    if (loading) return <GlobalSpinner />;
    if (!user) return null;

    return (
        <Section>
            <div className="flex flex-col h-[93vh]">
                {/* Header */}
                <Card className="p-2 sticky top-0 z-10 shadow-2xl">
                    <CardHeader className="p-0 flex items-center justify-between">
                        <Link className="flex items-center gap-3 cursor-pointer" href={`/profile/${userId}`}>
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user?.profileImage?.url} alt={user?.username} className="object-cover" />
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

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar">
                    <div className="flex flex-col justify-end min-h-full">
                        {/* User profile block (centered big avatar + username) */}
                        <div className="flex flex-col items-center justify-center gap-2 py-6">
                            <Avatar className="w-36 h-36">
                                <AvatarImage src={user?.profileImage?.url} alt={user?.username} className="object-cover" />
                                <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-xl font-medium">{user?.username}</p>
                            <Button variant={"outline"} onClick={() => router.push(`/profile/${userId}`)}>
                                View Profile
                            </Button>
                        </div>

                        {/* Messages */}
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, index) => {
                                const prev = messages[index - 1];
                                const isNewDay = !prev || !dayjs(prev.createdAt).isSame(msg.createdAt, "day");

                                return (
                                    <div key={msg._id} className="flex flex-col">
                                        {/* Date Separator */}
                                        {isNewDay && (
                                            <div className="flex justify-center my-6">
                                                <span className="bg-neutral-200 text-neutral-700 text-xs font-medium px-3 py-1 rounded-full">{getDateLabel(msg.createdAt)}</span>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`flex flex-col ${userId === msg.senderId ? "self-start" : "self-end"} ${isNewDay ? "mt-4" : "mt-2"}`}
                                        >
                                            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${userId === msg.senderId ? "bg-blue-200 text-black self-start" : "bg-green-200 text-black self-end"}`}>{msg.message || msg.content}</div>
                                            <p className="text-xs text-neutral-500 mt-1 text-right">{msg.createdAt ? dayjs(msg.createdAt).format("HH:mm") : ""}</p>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </AnimatePresence>

                        <div ref={bottomRef} />
                    </div>
                </CardContent>

                {/* Input */}
                <Card className="p-1 sticky bottom-0 left-0 right-0 z-40 shadow-2xl bg-background">
                    <CardFooter className="flex items-end gap-2 w-full p-2">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Type your message here..."
                            rows={1}
                            className="flex-1 min-h-[40px] max-h-[120px] resize-none px-3 py-2 rounded-md text-sm leading-tight"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                const el = e.target;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                        />
                        <Button className="h-[40px] w-[40px] flex items-center justify-center rounded-md" onClick={sendMessage} disabled={!content.trim() || sending}>
                            <SendHorizontal size={18} />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Section>
    );
};

export default Page;
