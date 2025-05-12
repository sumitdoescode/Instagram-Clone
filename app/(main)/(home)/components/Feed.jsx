import React from "react";
import FeedPosts from "./FeedPosts";

const Feed = () => {
    return (
        <div className="w-full max-w-lg flex justify-center">
            <div className="w-full">
                <FeedPosts />
            </div>
        </div>
    );
};

export default Feed;
