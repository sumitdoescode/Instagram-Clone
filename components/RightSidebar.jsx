import React from "react";
import RecommenedUsers from "./RecommenedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RightSidebar = () => {
    return (
        <Card className="w-full max-w-md py-5 lg:sticky lg:top-12">
            <CardHeader className="px-3">
                <CardTitle>Recommended Users</CardTitle>
            </CardHeader>
            <CardContent className="mt-5 px-3">
                <RecommenedUsers />
            </CardContent>
        </Card>
    );
};

export default RightSidebar;
