"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import dayjs from "dayjs";
import Section from "@/components/Section";
import GlobalSpinner from "@/components/GlobalSpinner";
import axios from "axios";
import { useUserContext } from "@/contexts/UserContextProvider";

const AccountPage = () => {
    const { user, loading } = useUserContext();
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const deleteAccount = async () => {
        try {
            setDeleting(true);
            const { data } = await axios.delete("/api/user");
            if (data.success) {
                toast.success("Account deleted successfully");
                router.push("/"); // Redirect to home page
            }
        } catch (error) {
            console.log(error);
            toast.error("Couldn't delete account. Try again!");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <GlobalSpinner />;
    if (!user) return null;

    return (
        <Section>
            <Card className="w-full p-4">
                <CardHeader className={"p-0"}>
                    <CardTitle className="text-2xl md:text-3xl">Account Settings</CardTitle>
                </CardHeader>

                <CardContent className={"max-w-lg w-full mx-auto p-0"}>
                    <Avatar className="w-50 h-50 m-auto">
                        <AvatarImage src={user?.profileImage?.url} alt="" className={"object-cover"} />
                        <AvatarFallback className="rounded-lg">{user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="mt-4 flex flex-col items-center w-full">
                        <h4 className="scroll-m-20 text-xl font-medium mt-2">{user?.username}</h4>
                        <p className="[&:not(:first-child)]:mt-1 text-white">{user?.email}</p>
                        <div className="flex items-start gap-2 mt-6">
                            <span>Joined At:</span>
                            <p className="text-md text-gray-300">{dayjs(user?.createdAt).format("DD MMMM YYYY")}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>_id:</span>
                            <p className="text-md text-gray-300 break-all text-center">{user?._id}</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className={"p-0"}>
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
                                <AlertDialogAction onClick={deleteAccount} className="cursor-pointer" disabled={deleting}>
                                    {deleting ? "Deleting..." : "Continue"}
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
