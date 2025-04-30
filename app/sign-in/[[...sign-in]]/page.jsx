// app/sign-in/page.js
import { SignIn } from "@clerk/nextjs";
import Section from "@/components/Section";

export default function SignInPage() {
    return (
        <Section>
            <div className="flex items-center justify-center w-full pt-24">
                <SignIn fallbackRedirectUrl="/" />
            </div>
        </Section>
    );
}
