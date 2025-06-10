import React from "react";

const Section = ({ children, className }) => {
    return (
        <section className={`py-2 ${className}`}>
            <div className="container mx-auto px-2 ">{children}</div>
        </section>
    );
};

export default Section;
