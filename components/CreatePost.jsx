"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BadgePlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { postWithToken } from "@/utils/fetcher";
import useSWRMutation from "swr/mutation";

const createPostFn = async (url, { arg }) => {
    const { image, caption, token } = arg;
    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    const res = await postWithToken(url, formData, token);
    return res;
};

const CreatePost = () => {
    const [image, setImage] = useState("");
    const [caption, setCaption] = useState("");
    const { getToken } = useAuth();
    const router = useRouter();

    const { trigger, isMutating } = useSWRMutation("/post", createPostFn);

    const handleCreatePost = async () => {
        const token = await getToken();

        if (!image || !caption.trim()) {
            return toast("Image and caption are required!");
        }

        try {
            const res = await trigger({ image, caption, token });
            if (res.success) {
                toast("Post created successfully!");
                setImage("");
                setCaption("");
                router.push("/");
            } else {
                toast("Error while creating post!");
            }
        } catch (error) {
            toast(error.message);
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                    <BadgePlus size={22} />
                    <span className="text-xl">Create Post</span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 w-full">
                    <div className="grid grid-cols-4 items-center gap-4 w-full">
                        <Input id="file" className="col-span-4" type="file" onChange={(e) => setImage(e.target.files[0])} required={true} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 w-full">
                        <Textarea placeholder="Type your Caption here." className="col-span-4" onChange={(e) => setCaption(e.target.value)} value={caption} required={true} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="cursor-pointer" onClick={handleCreatePost} disabled={isMutating}>
                        {isMutating ? "Posting..." : "Create Post"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
