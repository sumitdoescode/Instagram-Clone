"use client";
import Section from "@/components/Section";
import Feed from "./components/Feed";
import Recommendations from "./components/Recommendations";
import CreatePostHome from "./components/CreatePostHome";

const Home = () => {
    return (
        <div className="flex flex-col w-full h-full">
            <Section>
                <div className="flex flex-col items-center lg:items-start lg:flex-row w-full gap-10">
                    {/* Sidebar */}

                    <div className="flex flex-col w-full max-w-lg items-start">
                        <div className="lg:sticky lg:top-12 flex flex-col gap-4 w-full">
                            <Recommendations />
                            <CreatePostHome />
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="flex-1 flex justify-center">
                        <div className="w-full max-w-lg">
                            <Feed />
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default Home;
