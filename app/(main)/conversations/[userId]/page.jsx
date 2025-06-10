"use client";

import React from "react";
import Section from "@/components/Section";
import { fetchWithToken, postWithToken } from "@/utils/fetcher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRef, useEffect } from "react";

// page to show conversation with user
const ConversationPage = () => {
    const [content, setContent] = useState("");
    const { getToken } = useAuth();
    const { userId } = useParams();
    dayjs.extend(relativeTime);

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/message/user/${userId}`, token);
        if (error) throw new Error("Failed to fetch conversations");
        console.log(data);
        return data;
    };

    const { data, error, isLoading } = useSWR(`/message/user/${userId}`, fetcher);

    const bottomRef = useRef(null);
    // Scroll to bottom when messages load or message is sent
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [data?.messages]); // triggers when messages update

    const sendMessage = async () => {
        const token = await getToken();
        return await postWithToken(
            `/message/user/${userId}`,
            {
                content: content.trim(),
            },
            token
        );
    };

    const { trigger, isMutating } = useSWRMutation(`/message/user/${userId}`, sendMessage);

    const handleSendMessage = async () => {
        if (!content.trim()) return;
        const { data, error } = await trigger();
        console.log(data);

        if (error || !data.success) {
            toast("Error sending message");
            return;
        }
        setContent("");
    };

    if (isLoading) {
        return <GlobalSpinner />;
    }

    return (
        <Section>
            <Card className={`p-1 sticky top-10 z-10 shadow-2xl`}>
                <CardHeader className={"p-1 flex items-center justify-between"}>
                    <Link className="flex items-center gap-3 cursor-pointer" href={`/profile/${userId}`}>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={data?.user?.profileImage?.url} alt={data?.user?.username} />
                            <AvatarFallback>{data?.user?.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col w-full">
                            <CardTitle className="font-medium">{data?.user?.username}</CardTitle>
                            <p className="text-sm text-neutral-300">{data?.user?.gender}</p>
                        </div>
                    </Link>
                </CardHeader>
            </Card>

            <Card className={"p-1 mt-4"}>
                <CardHeader className={"text-center py-8"}>
                    <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={data?.user?.profileImage?.url} alt={data?.user?.username} />
                        <AvatarFallback>{data?.user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-medium text-center">{data?.user?.username}</h1>
                    <Link href={`/profile/${userId}`}>
                        <Button size={"sm"} variant={"outline"} className="cursor-pointer">
                            View Profile
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className={`p-1 relative z-0`}>
                    <div className="flex flex-col gap-3">
                        {data &&
                            data.messages.map(({ _id, message, content, senderId, receiverId, createdAt }) => {
                                return (
                                    <div key={_id} className={`max-w-md border rounded-lg px-2 py-0 tracking-tight ${userId === senderId ? "bg-blue-200 self-start" : "bg-green-200 self-end"}`}>
                                        <p className="text-base text-black font-medium leading-tight">{message || content}</p>
                                        <span className="text-sm text-neutral-800 mt-0">{dayjs(createdAt).fromNow()}</span>
                                    </div>
                                );
                            })}
                        {/* 👇 Invisible ref div at the bottom */}
                        <div ref={bottomRef} />
                    </div>
                </CardContent>
            </Card>

            <Card className={`p-1 sticky bottom-0 z-40 shadow-2xl mt-2`}>
                <CardFooter className="flex items-start justify-center gap-2 w-full p-1">
                    <Textarea placeholder="Type your message here." className={`resize-none h-[40px]`} value={content} onChange={(e) => setContent(e.target.value)} />
                    <Button variant="" className="cursor-pointer" onClick={handleSendMessage} disabled={!content.trim() || isMutating}>
                        Send
                    </Button>
                </CardFooter>
            </Card>
        </Section>
    );
};

export default ConversationPage;
