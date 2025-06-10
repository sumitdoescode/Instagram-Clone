"use client";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { fetchWithToken, patchWithToken } from "@/utils/fetcher";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import GlobalSpinner from "@/components/GlobalSpinner";
import Section from "@/components/Section";

const EditProfilePage = () => {
    const [usernameState, setUsernameState] = useState("");
    const [bioState, setBioState] = useState("");
    const [genderState, setGenderState] = useState("");
    const [profileImageState, setProfileImageState] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const { getToken } = useAuth();

    const fetcher = async () => {
        const token = await getToken();
        const { data, error } = await fetchWithToken(`/user`, token);
        if (error) throw new Error("Failed to fetch user profile");
        return data;
    };

    const { data, error, isLoading } = useSWR(`/user`, fetcher);

    useEffect(() => {
        if (data?.user) {
            setUsernameState(data.user.username);
            setBioState(data.user.bio);
            setGenderState(data.user.gender);
            setPreviewImage(data.user.profileImage.url);
        }
    }, [data]);

    const fetcher2 = async (url, { arg }) => {
        const { token, data } = arg;
        return await patchWithToken(url, data, token);
    };

    const { trigger, isMutating } = useSWRMutation(`/user`, fetcher2);

    const handleEditProfile = async () => {
        if (usernameState === data.user.username && bioState === data.user.bio && genderState === data.user.gender && !profileImageState) {
            toast("No changes to update");
            return;
        }

        const token = await getToken();
        const formData = new FormData();

        if (usernameState !== data.user.username) {
            formData.append("username", usernameState);
        }
        if (bioState !== data.user.bio) {
            formData.append("bio", bioState);
        }
        if (genderState !== data.user.gender) {
            formData.append("gender", genderState);
        }
        if (profileImageState) {
            formData.append("profileImage", profileImageState);
        }

        const { data: updatedData, error } = await trigger({
            token,
            data: formData,
        });

        if (error || !updatedData.success) {
            toast("Error updating profile");
            return;
        }

        mutate("/user");
        setProfileImageState(null);
        toast("Profile updated successfully");
    };

    if (isLoading) return <GlobalSpinner />;
    if (error) return <h1 className="text-xl">Failed to Get Own User Profile</h1>;

    const { username } = data.user;

    return (
        <Section>
            <Card className={"w-full"}>
                <CardHeader>
                    <CardTitle className={"text-3xl"}>Edit Profile</CardTitle>
                    <Avatar className="w-40 h-40 m-auto">
                        <AvatarImage src={previewImage} alt="User profile" className="object-cover" />
                        <AvatarFallback className="rounded-lg">{username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent className={"mt-10 w-full flex flex-col gap-8"}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Your Username" value={usernameState} onChange={(e) => setUsernameState(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" placeholder="Your Bio" value={bioState} onChange={(e) => setBioState(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={genderState} onValueChange={(value) => setGenderState(value)} id="gender">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="profile">Profile Image</Label>
                        <Input
                            id="profile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setProfileImageState(file);

                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPreviewImage(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                } else {
                                    setPreviewImage(data.user.profileImage.url);
                                }
                            }}
                        />
                        <p className="text-sm text-gray-500">{profileImageState ? `Selected File: ${profileImageState.name}` : "No file selected"}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className={"ml-auto"} onClick={handleEditProfile} disabled={isMutating}>
                        {isMutating ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </Section>
    );
};

export default EditProfilePage;
