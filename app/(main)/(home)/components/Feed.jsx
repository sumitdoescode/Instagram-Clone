import React from "react";
import FeedPosts from "./FeedPosts";

const Feed = () => {
    return (
        <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg">
                <FeedPosts />
            </div>
        </div>
    );
};

export default Feed;
