"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FaBookmark, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const UserPost = ({ _id, caption, image, author, isLiked, likesCount, commentCount, isAuthor, isBookmarked }) => {
    const router = useRouter();
    const [liked, setLiked] = useState(isLiked);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [likeCount, setLikeCount] = useState(likesCount);
    const [liking, setLiking] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);

    const toggleLike = async () => {
        try {
            setLiking(true);
            const { data } = await axios.post(`/api/post/toggleLike/${_id}`);
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
            const { data } = await axios.post(`/api/post/toggleBookmark/${_id}`);
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
        <Card className="w-full p-3">
            <CardContent onClick={() => router.push(`/post/${_id}`)} className="cursor-pointer p-0">
                <Image src={image.url} width={400} height={400} alt="Picture of the author" className="w-full object-cover rounded-md" />
            </CardContent>

            <CardFooter className="block p-0">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        {/* like button */}
                        <button className="bg-none border-none" onClick={toggleLike} disabled={liking}>
                            {liked ? <FcLike size={24} className="cursor-pointer" /> : <FaRegHeart className="cursor-pointer" size={22} />}
                        </button>

                        {/* comment button */}
                        <FaRegComment className="cursor-pointer" size={22} onClick={() => router.push(`/post/${_id}`)} />
                        <Dialog>
                            <DialogTrigger asChild className="cursor-pointer">
                                <Send />

                                {/* <Button variant="outline">Share</Button> */}
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share Post</DialogTitle>
                                    <DialogDescription>Anyone who has this link will be able to view this post.</DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="link" className="sr-only">
                                            Link
                                        </Label>
                                        <Input id="link" defaultValue={`https://instagram-clone-frontend-jet.vercel.app/post/${_id}`} readOnly />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="px-3 cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard
                                                .writeText(`https://instagram-clone-frontend-jet.vercel.app/post/${_id}`)
                                                .then(() => {
                                                    toast("Link copied to clipboard!");
                                                })
                                                .catch(() => {
                                                    toast("Failed to copy the link.");
                                                });
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

                    {/* bookmark button */}
                    <button className="bg-none border-none" onClick={toggleBookmark} disabled={bookmarking}>
                        {bookmarked ? <FaBookmark size={24} className="cursor-pointer" /> : <FaRegBookmark size={24} className="cursor-pointer" />}
                    </button>
                </div>

                {/* likes count */}
                <p className="text-sm text-gray-300 mt-2 font-medium">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                </p>

                {/* caption */}
                <p className="mt-3 text-gray-300 text-sm">{caption.length > 50 ? `${caption.slice(0, 50)}...` : caption}</p>

                {/* view all comments button */}
                <Link href={`/post/${_id}`} className="inline-block text-sm text-gray-300 mt-4 hover:underline">
                    View all {commentCount > 0 && commentCount} comments
                </Link>
            </CardFooter>
        </Card>
    );
};

export default UserPost;
