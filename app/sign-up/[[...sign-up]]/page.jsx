// app/sign-up/page.js
import { SignUp } from "@clerk/nextjs";
import Section from "@/components/Section";

export default function SignInPage() {
    return (
        <Section>
            <div className="flex items-center justify-center w-full pt-24">
                <SignUp fallbackRedirectUrl="/" />
            </div>
        </Section>
    );
}
