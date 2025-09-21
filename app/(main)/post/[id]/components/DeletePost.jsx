"use client";
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Trash } from "lucide-react";

const DeletePost = ({ _id }) => {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDeletePost = async () => {
        try {
            setDeleting(true);
            const { data } = await axios.delete(`/api/post/${_id}`);
            if (data.success) {
                toast("Post deleted successfully");
                router.push("/");
            }
        } catch (error) {
            console.log(error);
            toast("Error while deleting post");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash size={24} />
                    <span className="text-sm">Delete</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your post and remove your post data from our servers.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeletePost;
