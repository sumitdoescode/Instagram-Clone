"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BadgePlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

const CreatePost = () => {
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [previewURL, setPreviewURL] = useState(null);
    const [posting, setPosting] = useState(false);
    const router = useRouter();

    const fileInputRef = useRef(null);

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

    const createPost = async () => {
        try {
            setPosting(true);

            const formData = new FormData();
            formData.append("caption", caption);
            formData.append("image", image);
            const { data } = await axios.post("/api/post", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                toast("Post created successfully!");
                resetForm();
                setOpen(false);
                router.push("/");
            }
        } catch (error) {
            console.log(error);
            toast("Error while creating post!");
        } finally {
            setPosting(false);
        }
    };

    const handleCreatePost = async () => {
        if (!image || !caption.trim()) {
            return toast("Image and caption are required!");
        }
        createPost();
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
                    <Button type="submit" onClick={handleCreatePost} disabled={posting}>
                        {posting ? "Posting..." : "Create Post"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
