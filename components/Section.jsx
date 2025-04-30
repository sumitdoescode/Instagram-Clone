import React from "react";

const Section = ({ children, className }) => {
    return (
        <section className={`py-2 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 ">{children}</div>
        </section>
    );
};

export default Section;
