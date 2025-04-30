import React from "react";
import RecommenedUsers from "./RecommenedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RightSidebar = () => {
    return (
        <Card className="hidden lg:block ml-auto w-lg max-w-full py-5">
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
