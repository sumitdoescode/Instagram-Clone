"use client";
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DeleteChat = ({ conversationId }) => {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const deleteConversation = async () => {
        try {
            setDeleting(true);
            const { data } = await axios.delete(`/api/conversation/${conversationId}`);
            if (data.success) {
                toast("Conversation deleted successfully");
            }
            router.push("/chat");
        } catch (error) {
            console.log(error);
            toast("Error deleting conversation");
        } finally {
            setDeleting(false);
        }
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger>
                <Button className={"cursor-pointer"}>
                    <Trash2 />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your conversation and it's related messages</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteConversation} disabled={deleting}>
                        {deleting ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteChat;
