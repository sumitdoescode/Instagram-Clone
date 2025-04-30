"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
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
import { UserProfile } from "@clerk/nextjs";

const EditProfilePage = () => {
    const [usernameState, setUsernameState] = useState("");
    const [bioState, setBioState] = useState("");
    const [genderState, setGenderState] = useState("");
    const [profileImageState, setProfileImageState] = useState("");

    const { getToken } = useAuth();
    const fetcher = async () => {
        const token = await getToken();
        return await fetchWithToken(`/user`, token);
    };

    const { data, error, isLoading } = useSWR(`/user`, fetcher);

    useEffect(() => {
        if (data?.user) {
            setUsernameState(data.user.username);
            setBioState(data.user.bio);
            setGenderState(data.user.gender);
        }
    }, [data]);

    const fetcher2 = async (url, { arg }) => {
        const { token, data } = arg;
        const res = await patchWithToken(url, data, token);
        return res;
    };

    // api/v1
    const { trigger, isMutating } = useSWRMutation(`/user`, fetcher2);
    const handleEditProfile = async () => {
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

        formData.append("profileImage", profileImageState);
        try {
            const res = await trigger({
                token,
                data: formData,
            });
            if (res.success) {
                toast("Profile updated successfully");
            }
        } catch (error) {
            console.log(error);
            toast(error.response.data.message || "Error updating profile");
        }
    };

    if (error) return <h1 className="text-xl">Failed to Get Own User Profile</h1>;
    if (isLoading) return <h1 className="text-xl">loading...</h1>;
    const { _id, username, profileImage } = data.user;

    return (
        <Card className={"w-full"}>
            <CardHeader>
                <CardTitle className={"text-3xl"}>Edit Profile</CardTitle>
                <Avatar className="w-50 h-50 m-auto">
                    <AvatarImage src={profileImage} alt="username profileImage" className="object-cover" />
                    <AvatarFallback className="rounded-lg">{username.charAt(0)}</AvatarFallback>
                </Avatar>
            </CardHeader>
            <CardContent className={"mt-10 w-full flex flex-col gap-8"}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input placeholder="Your Username" value={usernameState} onChange={(e) => setUsernameState(e.target.value)} id="username" className="text-3xl" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input placeholder="Your Bio" value={bioState} onChange={(e) => setBioState(e.target.value)} id="bio" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={genderState} onValueChange={(value) => setGenderState(value)} id="gender">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Your Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="profile">Profile Image</Label>
                    <Input id="profile" type="file" onChange={(e) => setProfileImageState(e.target.files[0])} />
                    {profileImageState && <p>Selected File: {profileImageState.name}</p>}
                </div>
            </CardContent>
            <CardFooter>
                <Button className={"ml-auto"} onClick={handleEditProfile} disabled={isMutating}>
                    {isMutating ? "Saving..." : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EditProfilePage;
