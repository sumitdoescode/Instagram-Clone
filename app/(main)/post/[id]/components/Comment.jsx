"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { deleteWithToken } from "@/utils/fetcher";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

const Comment = ({ _id, text, createdAt, isAuthor, author, mutate, postId }) => {
    const { _id: authorId, username, profileImage, gender } = author;

    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 50;

    const { getToken } = useAuth();
    const router = useRouter();
    dayjs.extend(relativeTime);

    const deleteComment = async (url, { arg: token }) => {
        return await deleteWithToken(url, token);
    };

    const { trigger, isMutating } = useSWRMutation(`/comment/${_id}`, deleteComment);

    const handleDeleteComment = async () => {
        const token = await getToken();

        const { data, error } = await trigger(token);
        if (error || !data.success) {
            toast(error);
            return;
        }
        toast("Comment deleted successfully");
        mutate();
    };
    return (
        <Card className="w-full p-2 gap-3">
            <CardHeader className="p-0 mb-0 gap-0">
                <div className="flex items-center justify-between">
                    <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push(`/profile/${authorId}`)}>
                        <Avatar>
                            <AvatarImage src={profileImage.url} />
                            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="font-regular text-sm">{username}</CardTitle>
                            {gender && <CardDescription className="text-sm">{gender === "male" ? "he/him" : "she/her"}</CardDescription>}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">{dayjs(createdAt).fromNow()}</p>
                </div>
            </CardHeader>

            <CardContent className="p-0 px-2 text-sm">
                <div className="flex items-end justify-between gap-2">
                    <p className="text-sm">
                        {expanded || !isLong ? text : `${text.slice(0, 100)}...`}
                        {isLong && (
                            <span onClick={() => setExpanded((prev) => !prev)} className="ml-2 text-gray-400 hover:underline cursor-pointer">
                                {expanded ? "Show less" : "Show more"}
                            </span>
                        )}
                    </p>
                    {isAuthor && (
                        <button disabled={isMutating}>
                            <Trash2 size={18} className="cursor-pointer text-red-500 min-w-fit" onClick={handleDeleteComment} />
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Comment;
