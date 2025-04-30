import React from "react";
import Posts from "./Posts";

const Feed = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-lg">
                <Posts />
            </div>
        </div>
    );
};

export default Feed;
