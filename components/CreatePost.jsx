"use client";

import { useRef, useState } from "react";
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
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [previewURL, setPreviewURL] = useState(null);

    const fileInputRef = useRef(null);
    const { getToken } = useAuth();
    const router = useRouter();

    const { trigger, isMutating } = useSWRMutation("/post", createPostFn);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setPreviewURL(URL.createObjectURL(file));
        } else {
            setPreviewURL(null);
        }
    };

    const resetForm = () => {
        setImage(null);
        setCaption("");
        setPreviewURL(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleCreatePost = async () => {
        const token = await getToken();

        if (!image || !caption.trim()) {
            return toast("Image and caption are required!");
        }

        try {
            const res = await trigger({ image, caption, token });
            if (res.success) {
                toast("Post created successfully!");
                resetForm();
                setOpen(false);
                router.push("/");
            } else {
                toast("Error while creating post!");
            }
        } catch (error) {
            toast(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    <BadgePlus size={22} />
                    <span className="text-xl">Create Post</span>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 w-full">
                    <Input id="file" ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="col-span-4" />

                    {previewURL && <img src={previewURL} alt="Preview" className="mt-2 max-h-64 rounded-lg object-contain border" />}

                    <Textarea placeholder="Type your caption here." className="col-span-4" value={caption} onChange={(e) => setCaption(e.target.value)} required />
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleCreatePost} disabled={isMutating}>
                        {isMutating ? "Posting..." : "Create Post"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
