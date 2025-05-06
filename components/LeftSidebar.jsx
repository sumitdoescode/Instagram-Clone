"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Home, Search, MessageCircleMore, User, LogOut, CircleUserRound } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import CreatePost from "./CreatePost";
import { fetchWithToken } from "@/utils/fetcher";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlignJustify } from "lucide-react";

const LeftSidebar = () => {
    const { getToken } = useAuth();

    // Fetch user data
    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken("/user", token);
        if (error) throw new Error("Failed to fetch user");
        return data;
    };

    const { data, error, isLoading } = useSWR("/user", fetcher);

    // if (isLoading) return <h1 className="text-base">Loading...</h1>;
    if (error) return <h1 className="text-base">❌ Error fetching user</h1>;

    const { user } = data;

    // Sidebar menu items
    const items = [
        { title: "Home", url: "/", icon: Home },
        { title: "Search", url: "/search", icon: Search },
        { title: "Messages", url: "/message", icon: MessageCircleMore },
        { title: "Profile", url: `/profile`, icon: User },
        { title: "Account", url: `/account`, icon: CircleUserRound },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="p-2">
                    <AlignJustify size={24} />
                </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[250px] p-0">
                <SheetHeader className="p-2">
                    <SheetTitle>
                        <Link href="/">
                            <Image src="/instagram-logo.png" width={500} height={500} alt="Instagram Logo" className="w-[160px] h-auto" />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                {/* Sidebar Items */}
                <div className="px-2">
                    <div className="flex flex-col gap-4">
                        {items.map(({ title, url, icon }) => (
                            <div key={title} className="px-2 py-1 hover:bg-stone-800 duration-200 ease-in-out rounded-md">
                                <Link href={url} className="flex items-center gap-2">
                                    <icon size={22} />
                                    <span className="text-xl">{title}</span>
                                </Link>
                            </div>
                        ))}

                        {/* Create Post */}
                        <div className="px-2 py-1 hover:bg-stone-800 duration-200 ease-in-out rounded-md cursor-pointer">
                            <CreatePost />
                        </div>

                        {/* Logout */}
                        <div className="px-2 py-1 hover:bg-stone-800 duration-200 ease-in-out rounded-md cursor-pointer">
                            <SignOutButton fallbackredirecturl="/sign-in">
                                <div className="flex items-center gap-2">
                                    <LogOut size={22} />
                                    <span className="text-xl">Logout</span>
                                </div>
                            </SignOutButton>
                        </div>
                    </div>
                </div>

                {/* Footer: User Info */}
                <SheetFooter>
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.profileImage?.url} alt={user?.username} />
                            <AvatarFallback>{user?.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user?.username}</span>
                            <span className="truncate text-xs">{user?.email}</span>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default LeftSidebar;
