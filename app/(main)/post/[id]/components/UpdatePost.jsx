"use client";

import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const UpdatePost = ({ _id, caption }) => {
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [captionInput, setCaptionInput] = useState(caption);
    const [previewURL, setPreviewURL] = useState(null);

    const resetState = () => {
        setImage(null);
        setCaptionInput(caption);
        setPreviewURL(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreviewURL(file ? URL.createObjectURL(file) : null);
    };

    const updatePost = async () => {
        try {
            const formData = new FormData();
            if (image) {
                formData.append("image", image);
            }
            formData.append("caption", captionInput);
            const { data } = await axios.patch(`/api/post/${_id}`, formData);
            if (data.success) {
                toast("Post updated successfully");
                setOpen(false);
                router.push(`/post/${_id}`);
            }
        } catch (error) {
            console.log(error);
            toast("Error while updating post");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Drawer
            open={open}
            onOpenChange={(state) => {
                setOpen(state);
                if (state) resetState();
            }}
        >
            <DrawerTrigger asChild>
                <Button>Update Post</Button>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="font-regular text-2xl">Update Your Post</DrawerTitle>

                    <div className="grid gap-4 py-4 w-full">
                        <div className="grid grid-cols-4 items-center gap-4 w-full">
                            <Input id="file" className="col-span-4" type="file" onChange={handleImageChange} />
                        </div>

                        {previewURL && <img src={previewURL} alt="Preview" className="mt-2 max-h-64 rounded-lg object-contain border" />}

                        <div className="grid grid-cols-4 gap-4 w-full">
                            <Textarea placeholder="Type your caption here..." className="col-span-4" onChange={(e) => setCaptionInput(e.target.value)} value={captionInput} />
                        </div>
                    </div>
                </DrawerHeader>

                <DrawerFooter>
                    <Button onClick={updatePost} disabled={updating}>
                        {updating ? "Updating..." : "Update"}
                    </Button>
                    <DrawerClose asChild>
                        <Button className="w-full" onClick={resetState}>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default UpdatePost;
