"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Comment from "./Comment";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import GlobalSpinner from "@/components/GlobalSpinner";
import { CirclePlus } from "lucide-react";

const Comments = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [commentText, setCommentText] = useState("");

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`/api/comment/post/${postId}`);
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching comments");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchComments();
    }, []);

    const addComment = async () => {
        try {
            setAdding(true);
            const { data } = await axios.post(`/api/comment/post/${postId}`, { text: commentText });
            if (data.success) {
                toast("Comment added successfully");
                setCommentText("");
            }
        } catch (error) {
            console.log(error);
            toast("Error adding comment");
        } finally {
            setAdding(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) {
            return toast("Comment is required!");
        }
        addComment();
        fetchComments();
    };

    if (loading) return <GlobalSpinner />;

    return (
        <Card className={"w-full p-3 gap-3"}>
            <CardHeader className={"p-0"}>
                <CardTitle className={"flex items-center justify-between mb-0 p-o gap-0"}>
                    <h1 className="text-lg">Comments ({comments?.length || 0})</h1>
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <div className="flex items-center justify-center gap-2 border cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80 p-2 rounded-lg">
                                <CirclePlus size={20} />
                                <span className="text-sm">Add</span>
                            </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Add Comment</AlertDialogTitle>
                                <Textarea placeholder="Type your comment here." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction disabled={adding} onClick={handleAddComment} size="sm">
                                    {adding ? "Adding..." : "Add Comment"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardTitle>
            </CardHeader>
            {comments?.length > 0 && <CardContent className={"w-full flex flex-col gap-3 p-0"}>{comments?.length && comments.map((comment) => <Comment key={comment._id} {...comment} fetchComments={fetchComments} postId={postId} />)}</CardContent>}
        </Card>
    );
};

export default Comments;
