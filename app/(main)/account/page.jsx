"use client";

import React from "react";
import { fetchWithToken, deleteWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import dayjs from "dayjs";
import Section from "@/components/Section";
import GlobalSpinner from "@/components/GlobalSpinner";

const AccountPage = () => {
    const { getToken } = useAuth();
    const router = useRouter();

    // Fetch user data
    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/user", token);
        if (error) throw new Error(error);
        return data;
    };
    const { data, error, isLoading } = useSWR("/user", fetcher);

    const { user: userData } = data || {};

    // Delete account mutation
    const deleteAccount = async (url, { arg: token }) => {
        return await deleteWithToken(url, token);
    };
    const { trigger, isMutating } = useSWRMutation("/user", deleteAccount);

    // Handle Delete
    const handleDeleteAccount = async () => {
        const token = await getToken();
        const { data, error } = await trigger(token); // 👈 token bhejna padta hai `arg` me

        if (error || !data.success) {
            toast.error("Couldn't delete account. Try again!");
            return;
        }

        toast.success("Account deleted successfully");
        router.push("/"); // Redirect to home page
    };

    if (isLoading) return <GlobalSpinner />;
    if (error) return <h1 className="text-xl">❌ Error fetching user</h1>;

    return (
        <Section>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Account Settings</CardTitle>
                </CardHeader>

                <CardContent className={"max-w-lg w-full mx-auto"}>
                    <Avatar className="w-50 h-50 m-auto">
                        <AvatarImage src={userData?.profileImage.url} alt="" />
                        <AvatarFallback className="rounded-lg">{userData?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="mt-4 flex flex-col items-center w-full">
                        <h4 className="scroll-m-20 text-xl font-medium mt-2">{userData?.username}</h4>
                        <p className="[&:not(:first-child)]:mt-1 text-white">{userData?.email}</p>
                        <div className="flex items-start gap-2 mt-6">
                            <span>Joined At:</span>
                            <p className="text-md text-gray-300">{dayjs(userData?.createdAt).format("DD MMMM YYYY")}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>_id:</span>
                            <p className="text-md text-gray-300 break-all text-center">{userData?._id}</p>
                        </div>
                        {/* <div className="flex items-start gap-2">
                            <span>clerkId:</span>
                            <p className="text-md text-gray-300 break-all text-center max-w-full">{userData?.clerkId}</p>
                        </div> */}
                    </div>
                </CardContent>

                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger className="mx-auto">
                            <Button className="cursor-pointer" variant="destructive">
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="cursor-pointer" disabled={isMutating}>
                                    {isMutating ? "Deleting..." : "Continue"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </Section>
    );
};

export default AccountPage;
