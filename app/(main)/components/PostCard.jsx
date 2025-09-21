"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FaBookmark, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Send } from "lucide-react";
import axios from "axios";

const PostCard = ({ _id, caption, image, author, isLiked, likesCount, commentCount, isAuthor, isBookmarked, fromRendered }) => {
    const router = useRouter();

    const [liked, setLiked] = useState(isLiked);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [likeCount, setLikeCount] = useState(likesCount);
    const [liking, setLiking] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);
    const [postUrl, setPostUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPostUrl(`${window.location.origin}/post/${_id}`);
        }
    }, [_id]);

    const { username, profileImage, gender } = author;

    const toggleLike = async () => {
        try {
            setLiking(true);
            const { data } = await axios.get(`/api/post/toggleLike/${_id}`);
            if (data.success) {
                setLiked(data.isLiked);
                setLikeCount((prev) => (data.isLiked ? prev + 1 : prev - 1));
            }
        } catch (error) {
            console.log(error);
            toast("Error occurred while liking post");
        } finally {
            setLiking(false);
        }
    };

    const toggleBookmark = async () => {
        try {
            setBookmarking(true);
            const { data } = await axios.get(`/api/post/toggleBookmark/${_id}`);
            if (data.success) {
                setBookmarked(data.isBookmarked);
            }
            toast(data.isBookmarked ? "Post bookmarked successfully" : "Post removed from bookmarks");
        } catch (err) {
            console.log(err);
            toast("Error occurred while bookmarking post");
        } finally {
            setBookmarking(false);
        }
    };

    return (
        <Card className="w-full p-3 gap-3">
            <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                    {/* Profile Info */}
                    <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push(`/profile/${author._id}`)}>
                        <Avatar>
                            <AvatarImage src={profileImage?.url} />
                            <AvatarFallback>{username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="text-base font-normal">{username}</CardTitle>
                            {gender && <CardDescription className="text-sm -mt-1">{gender === "male" ? "he/him" : "she/her"}</CardDescription>}
                        </div>
                    </div>

                    {/* Author Badge */}
                    {isAuthor && <Badge className="text-xs rounded-lg">Author</Badge>}
                </div>
            </CardHeader>

            {/* Post Image (safe rendering) */}
            {image?.url && (
                <CardContent onClick={() => router.push(`/post/${_id}`)} className="cursor-pointer p-0">
                    <Image src={image.url} width={400} height={400} alt="Post image" className="w-full rounded-lg object-cover" priority />
                </CardContent>
            )}

            <CardFooter className="block p-0 mt-5">
                <div className="flex items-center justify-between w-full">
                    {/* Like, Comment, Share Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="bg-none border-none" onClick={toggleLike} disabled={liking}>
                            {liked ? <FcLike size={24} className="cursor-pointer" /> : <FaRegHeart className="cursor-pointer" size={22} />}
                        </button>

                        {fromRendered !== "postDetailsPage" && <FaRegComment className="cursor-pointer" size={22} onClick={() => router.push(`/post/${_id}`)} />}

                        {/* Share Post Dialog */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Send className="cursor-pointer" />
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share Post</DialogTitle>
                                    <DialogDescription>Anyone with this link can view the post.</DialogDescription>
                                </DialogHeader>

                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="link" className="sr-only">
                                            Link
                                        </Label>
                                        <Input id="link" defaultValue={`${window.location.origin}/post/${_id}`} readOnly />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="px-3 cursor-pointer"
                                        onClick={() => {
                                            if (postUrl) {
                                                navigator.clipboard
                                                    .writeText(postUrl)
                                                    .then(() => toast("Link copied!"))
                                                    .catch(() => toast("Failed to copy"));
                                            }
                                        }}
                                    >
                                        <span className="sr-only">Copy</span>
                                        <Copy />
                                    </Button>
                                </div>

                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Close
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Bookmark */}
                    <button className="bg-none border-none" onClick={toggleBookmark} disabled={bookmarking}>
                        {bookmarked ? <FaBookmark size={24} className="cursor-pointer" /> : <FaRegBookmark size={24} className="cursor-pointer" />}
                    </button>
                </div>

                {/* Likes count */}
                <p className="text-sm text-gray-300 mt-2 font-medium">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                </p>

                {/* Caption & Comments link (optional) */}
                {fromRendered !== "postDetailsPage" && (
                    <>
                        <p className="mt-3 text-gray-300 text-sm">{caption.length > 50 ? `${caption.slice(0, 50)}...` : caption}</p>
                        <Link href={`/post/${_id}`} className="inline-block text-sm text-gray-300 mt-4 hover:underline">
                            View all {commentCount > 0 && commentCount} comments
                        </Link>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default PostCard;
