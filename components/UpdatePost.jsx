"use client";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { patchWithToken } from "@/utils/fetcher";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const updatePost = async (url, { arg }) => {
    const { token, formData } = arg;

    return await patchWithToken(url, formData, token);
};

const UpdatePost = ({ _id, caption }) => {
    const { trigger, isMutating } = useSWRMutation(`/post/${_id}`, updatePost);
    const { getToken } = useAuth();
    const router = useRouter();

    const [image, setImage] = useState("");
    const [captionInput, setCaptionInput] = useState(caption);

    const handleUpdatePost = async () => {
        const token = await getToken();
        const formData = new FormData();
        formData.append("image", image);
        formData.append("caption", captionInput);
        console.log(formData);
        const res = await trigger({ token, formData });
        if (res.success) {
            toast("Post updated successfully");
            // router.push(`/post/${_id}`);
        } else {
            toast("Error while updating post");
        }
    };
    return (
        <Drawer>
            <DrawerTrigger>
                <Button>Update Post</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className={"font-regular text-2xl"}>Update Your Post</DrawerTitle>
                </DrawerHeader>

                <div className="grid gap-4 py-4 w-full">
                    <div className="grid grid-cols-4 items-center gap-4 w-full">
                        <Input id="file" className="col-span-4" type="file" onChange={(e) => setImage(e.target.files[0])} required={true} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 w-full">
                        <Textarea placeholder="Type your Caption here." className="col-span-4" onChange={(e) => setCaptionInput(e.target.value)} value={captionInput} required={true} />
                    </div>
                </div>

                <DrawerFooter>
                    <Button onClick={handleUpdatePost} disabled={isMutating}>
                        {isMutating ? "Updating..." : "Update"}
                    </Button>
                    <DrawerClose>
                        <Button className={"w-full"}>Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default UpdatePost;
