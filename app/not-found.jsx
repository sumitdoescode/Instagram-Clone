import React from "react";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
    return (
        <Section>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">404</h1>
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance text-rose-500 my-2">page not found</h1>
                    <Link href={"/"} className="mx-auto cursor-pointer">
                        <Button className="mt-4">Go back home</Button>
                    </Link>
                </div>
            </div>
        </Section>
    );
};

export default NotFound;
