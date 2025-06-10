import Section from "@/components/Section";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Feed from "./components/Feed";
import Recommendations from "./components/Recommendations";

const Home = async () => {
    return (
        <div className="flex flex-col w-full h-full">
            <Section>
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-10 w-full">
                    <Recommendations />
                    <Feed />
                </div>
            </Section>
        </div>
    );
};

export default Home;
