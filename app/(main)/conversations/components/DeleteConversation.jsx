import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { deleteWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";

const DeleteConversation = ({ conversationId }) => {
    // here we need conversationId to delete the conversation
    const { getToken } = useAuth();
    const deleteConversation = async () => {
        const token = await getToken();
        return await deleteWithToken(`/conversation/${conversationId}`, token);
    };

    const { trigger, isMutating } = useSWRMutation(`/conversation/${conversationId}`, deleteConversation);

    const handleDeleteConversation = async () => {
        const { data, error } = await trigger();
        if (error || !data.success) {
            return toast("Error deleting conversation");
        }
        console.log(data);
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
                    <AlertDialogAction onClick={handleDeleteConversation} disabled={isMutating}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConversation;
