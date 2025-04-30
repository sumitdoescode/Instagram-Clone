import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";
import Section from "@/components/Section";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { auth } from "@clerk/nextjs/server";

const Home = async () => {
    return (
        <div className="flex flex-col w-full h-full">
            {/* <SidebarTrigger></SidebarTrigger> */}
            <Section>
                <div className="flex items-start w-full">
                    <Feed />
                    <RightSidebar />
                </div>
            </Section>
        </div>
    );
};

export default Home;
