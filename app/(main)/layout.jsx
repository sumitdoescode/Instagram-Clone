import React from "react";
import LeftSidebar from "./components/LeftSidebar";

const layout = ({ children }) => {
    return (
        <div>
            <LeftSidebar />
            {children}
        </div>
    );
};

export default layout;
