"use client";
import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { fetchWithToken } from "@/utils/fetcher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FaBookmark, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Post = ({ _id, caption, image, author, isLiked, likesCount, commentCount, isAuthor, isBookmarked, fromRendered }) => {
    const router = useRouter();
    const { getToken } = useAuth();
    const [liked, setLiked] = useState(isLiked);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [likeCount, setlikeCount] = useState(likesCount);

    const toggleLike = async () => {
        if (liked) {
            // if user is already liked the post then decrement the likes count
            setlikeCount((prev) => prev - 1);
        } else {
            // else increment the likes count
            setlikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
        const token = await getToken();
        const res = await fetchWithToken(`/post/toggleLike/${_id}`, token);
        if (res.success) {
        } else {
            // means api call fails then revert the ui changes
            setLiked((prev) => !prev);
            if (liked) {
                setlikeCount((prev) => prev + 1);
            } else {
                setlikeCount((prev) => prev - 1);
            }
            toast("Error liking post");
        }
    };

    const toggleBookmark = async () => {
        setBookmarked(!bookmarked);
        const token = await getToken();
        const res = await fetchWithToken(`/post/toggleBookmark/${_id}`, token);
        if (res.success) {
            if (res.isBookmarked) {
                toast("Post bookmarked successfully");
            } else {
                toast("Post removed from bookmarks");
            }
        } else {
            // means api call fails then revert the ui changes
            setBookmarked((prev) => !prev);
            toast("Error bookmarking post");
        }
    };
    const { username, profileImage, gender } = author;
    return (
        <Card className="w-full pt-3 py-5 gap-3">
            <CardHeader className="px-2">
                <div className="flex items-center justify-between">
                    <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push(`/profile/${author._id}`)}>
                        <Avatar>
                            <AvatarImage src={profileImage} />
                            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className=" font-medium">{username}</CardTitle>
                            {gender && <CardDescription className="text-sm">{gender === "male" ? "he/him" : "she/her"}</CardDescription>}
                        </div>
                    </div>
                    {isAuthor && <Badge className="text-xs rounded-lg">Author</Badge>}
                </div>
            </CardHeader>

            <CardContent onClick={() => router.push(`/post/${_id}`)} className="cursor-pointer px-2">
                <Image src={image} width={400} height={400} alt="Picture of the author" className="w-full rounded-lg object-cover" priority />
            </CardContent>

            <CardFooter className={"block px-3 mt-5"}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div onClick={toggleLike}>{liked ? <FcLike size={24} className="cursor-pointer" /> : <FaRegHeart className="cursor-pointer" size={22} />}</div>
                        {fromRendered === "postDetailsPage" ? null : <FaRegComment className="cursor-pointer" size={22} onClick={() => router.push(`/post/${_id}`)} />}
                    </div>
                    <div onClick={toggleBookmark}>{bookmarked ? <FaBookmark size={24} className="cursor-pointer" /> : <FaRegBookmark size={24} className="cursor-pointer" />}</div>
                </div>
                <p className="text-sm text-gray-300 mt-2 font-medium">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                </p>
                {fromRendered === "postDetailsPage" ? null : (
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

export default Post;
