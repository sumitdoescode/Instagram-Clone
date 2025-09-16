"use client";

import React, { useState, useEffect } from "react";
import Post from "../../components/PostCard";
import GlobalSpinner from "@/components/GlobalSpinner";
import { toast } from "sonner";
import axios from "axios";

const UserBookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const { data } = await axios.get(`/api/user/bookmarks`);
                if (data.success) {
                    setBookmarks(data.bookmarks);
                }
            } catch (error) {
                console.log(error);
                toast.error("Error fetching bookmarks");
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    if (loading) return <GlobalSpinner />;

    if (!bookmarks?.length)
        return (
            <div className="mt-10 flex items-center justify-center w-full">
                <h1 className="text-xl text-center">There are no bookmarks yet.. 😔</h1>
            </div>
        );

    return (
        <div className="mt-10 flex items-center justify-center w-full">
            <div className="flex flex-col gap-6 w-full">
                {bookmarks &&
                    bookmarks.map((bookmark) => {
                        return <Post key={bookmark._id} {...bookmark} />;
                    })}
            </div>
        </div>
    );
};

export default UserBookmarks;
