"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Home, Search, MessageCircleMore, User, LogOut, CircleUserRound } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import CreatePost from "./CreatePost";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlignJustify } from "lucide-react";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useUserContext } from "@/contexts/UserContextProvider";

const LeftSidebar = () => {
    const { user, loading } = useUserContext();

    if (loading) return <GlobalSpinner />;
    if (!user) return null;

    // Sidebar menu items
    const items = [
        { title: "Home", url: "/", Icon: Home },
        { title: "Search", url: "/search", Icon: Search },
        { title: "Chat", url: "/chat", Icon: MessageCircleMore },
        { title: "Profile", url: `/profile`, Icon: User },
        { title: "Account", url: `/account`, Icon: CircleUserRound },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild className="sticky top-0 z-50 w-full bg-stone-950">
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
                {/* Sidebar Items */}
                <div className="px-2">
                    <div className="flex flex-col gap-4">
                        {items.map(({ title, url, Icon }, index) => (
                            <React.Fragment key={title}>
                                <div className="px-2 py-1 hover:bg-stone-800 duration-200 ease-in-out rounded-md">
                                    <Link href={url} className="flex items-center gap-2">
                                        <Icon size={22} />
                                        <span className="text-xl">{title}</span>
                                    </Link>
                                </div>

                                {/* Insert CreatePost after Home (index 0) */}
                                {index === 0 && (
                                    <div className="px-2 py-1 hover:bg-stone-800 duration-200 ease-in-out rounded-md cursor-pointer">
                                        <CreatePost />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

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
                            <AvatarImage src={user?.profileImage?.url} alt={user?.username} className={"object-cover"} />
                            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
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
