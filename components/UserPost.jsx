"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { fetchWithToken } from "@/utils/fetcher";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FaBookmark, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const UserPost = ({ _id, caption, image, author, isLiked, likesCount, commentCount, isAuthor, isBookmarked }) => {
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
        const token = await getToken();
        const res = await fetchWithToken(`/post/toggleBookmark/${_id}`, token);
        if (res.success) {
            setBookmarked(res.isBookmarked);
            if (res.isBookmarked) {
                toast("Post bookmarked successfully");
            } else {
                toast("Post removed from bookmarks");
            }
        } else {
            // means api call fails then revert the ui changes
            toast("Error bookmarking post");
        }
    };

    return (
        <Card className="w-full p-2">
            <CardContent onClick={() => router.push(`/post/${_id}`)} className="cursor-pointer p-0">
                <Image src={image} width={400} height={400} alt="Picture of the author" className="w-full object-cover rounded-md" />
            </CardContent>

            <CardFooter className="block p-3 pb-5 pt-0">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div onClick={toggleLike}>{liked ? <FcLike size={24} className="cursor-pointer" /> : <FaRegHeart className="cursor-pointer" size={22} />}</div>
                        <FaRegComment className="cursor-pointer" size={22} onClick={() => router.push(`/post/${_id}`)} />
                    </div>
                    <div onClick={toggleBookmark}>{bookmarked ? <FaBookmark size={24} className="cursor-pointer" /> : <FaRegBookmark size={24} className="cursor-pointer" />}</div>
                </div>
                <p className="text-sm text-gray-300 mt-2 font-medium">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                </p>
                <p className="mt-3 text-gray-300 text-sm">{caption.length > 50 ? `${caption.slice(0, 50)}...` : caption}</p>
                <Link href={`/post/${_id}`} className="inline-block text-sm text-gray-300 mt-4 hover:underline">
                    View all {commentCount > 0 && commentCount} comments
                </Link>
            </CardFooter>
        </Card>
    );
};

export default UserPost;
