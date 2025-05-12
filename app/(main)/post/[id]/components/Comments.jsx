"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../../../../../components/ui/button";
import Comment from "./Comment";
import { fetchWithToken, postWithToken } from "@/utils/fetcher";
import useSWRMutation from "swr/mutation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";

const Comments = ({ postId }) => {
    const [comment, setComment] = useState("");
    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/comment/post/${postId}`, token);
        if (error) throw new Error(error);
        return data;
    };

    const { data, error, isLoading, mutate } = useSWR(`/comment/post/${postId}`, fetcher);

    const addComment = async (url, { arg }) => {
        const { token, comment } = arg;
        return await postWithToken(url, { text: comment }, token);
    };

    const { trigger, isMutating } = useSWRMutation(`/comment/post/${postId}`, addComment);

    const handleAddComment = async () => {
        if (!comment.trim()) {
            return toast("Comment is required!");
        }

        const token = await getToken();
        const { data, error } = await trigger({ token, comment });

        if (error || !data?.success) {
            toast(error || "Error adding comment");
            return;
        }

        toast("Comment added successfully");
        setComment("");
        mutate(); // Refresh the comment list
    };

    if (error)
        return (
            <div className="mt-10">
                <h1 className="text-5xl text-white mb-4">{error}</h1>
                <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
        );

    return (
        <Card className={"w-full py-4 px-1 gap-3"}>
            <CardHeader className={"px-3"}>
                <CardTitle className={"flex items-center justify-between"}>
                    <h1 className="text-lg">Comments ({data?.comments?.length || 0})</h1>
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button>Add Comment</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <Textarea placeholder="Type your comment here." value={comment} onChange={(e) => setComment(e.target.value)} />
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction disabled={isMutating} onClick={handleAddComment} size="sm">
                                    {isMutating ? "Adding..." : "Add Comment"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardTitle>
            </CardHeader>
            <CardContent className={"w-full flex flex-col gap-3 px-2"}>
                {data?.comments?.length ? data.comments.map((comment) => <Comment key={comment._id} {...comment} mutate={mutate} postId={postId} />) : <h1 className="text-lg">No comments yet</h1>}
            </CardContent>
        </Card>
    );
};

export default Comments;
