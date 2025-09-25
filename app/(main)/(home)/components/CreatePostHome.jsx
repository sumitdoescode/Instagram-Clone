"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreatePost from "../../components/CreatePost";

const CreatePostHome = () => {
    return (
        <Card className="w-full p-3 gap-0">
            <CardHeader className="p-0 flex items-center justify-center">
                <CreatePost />
            </CardHeader>
        </Card>
    );
};

export default CreatePostHome;
