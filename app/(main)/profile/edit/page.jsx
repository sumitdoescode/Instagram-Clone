"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import GlobalSpinner from "@/components/GlobalSpinner";
import Section from "@/components/Section";
import { toast } from "sonner";
import axios from "axios";
import { useUserContext } from "@/contexts/UserContextProvider";
import { useRouter } from "next/navigation";

const EditProfilePage = () => {
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [gender, setGender] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const { user, loading } = useUserContext();
    const [editing, setEditing] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setUsername(user.username);
        setBio(user.bio);
        setGender(user.gender);
        setPreviewImage(user.profileImage.url);
    }, [user]);

    const editProfile = async () => {
        try {
            setEditing(true);

            const formData = new FormData();
            formData.append("username", username);
            formData.append("bio", bio);
            formData.append("gender", gender);
            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            const { data } = await axios.patch(`/api/user`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (data.success) {
                toast("Profile updated successfully");
                router.push("/profile");
                setUsername(data.user.username);
                setBio(data.user.bio);
                setGender(data.user.gender);
                setPreviewImage(data.user.profileImage.url);
            }

            setProfileImage(null);
        } catch (error) {
            console.log(error);
            toast.error("Error updating profile");
        } finally {
            setEditing(false);
        }
    };

    if (loading) return <GlobalSpinner />;

    return (
        <Section>
            <Card className={"w-full p-4"}>
                <CardHeader className={"p-0"}>
                    <CardTitle className={"text-3xl"}>Edit Profile</CardTitle>
                    <Avatar className="w-45 h-45 m-auto">
                        <AvatarImage src={previewImage} alt="User profile" className="object-cover" />
                        <AvatarFallback className="rounded-lg">{user.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent className={"mt-10 w-full flex flex-col gap-8 p-0"}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Your Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" placeholder="Your Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={(value) => setGender(value)} id="gender">
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
                                setProfileImage(file);

                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPreviewImage(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                } else {
                                    setPreviewImage(user?.profileImage?.url);
                                }
                            }}
                        />
                        <p className="text-sm text-gray-500">{profileImage ? `Selected File: ${profileImage.name}` : "No file selected"}</p>
                    </div>
                </CardContent>
                <CardFooter className={"p-0"}>
                    <Button className={"ml-auto"} onClick={editProfile} disabled={editing}>
                        {editing ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </Section>
    );
};

export default EditProfilePage;
