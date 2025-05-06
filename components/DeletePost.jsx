"use client";
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { deleteWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Ensure toast is imported correctly

const deletePost = async (url, { arg: token }) => {
    return await deleteWithToken(url, token);
};

const DeletePost = ({ id }) => {
    // Destructure id from props
    const { trigger, isMutating } = useSWRMutation(`/post/${id}`, deletePost);
    const { getToken } = useAuth();
    const router = useRouter();

    const handleDeletePost = async () => {
        const token = await getToken();
        const { data, error } = await trigger(token);
        if (error || !data.success) {
            toast("Error while deleting post");
            return;
        }
        toast("Post deleted successfully");
        router.push("/"); // Redirect to home page
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Post</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your post and remove your post data from our servers.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} disabled={isMutating}>
                        {isMutating ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeletePost;
