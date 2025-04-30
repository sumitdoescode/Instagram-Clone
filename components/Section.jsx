import React from "react";

const Section = ({ children }) => {
    return (
        <section className="py-14 w-full">
            <div className="max-w-7xl mx-auto px-4 ">{children}</div>
        </section>
    );
};

export default Section;
