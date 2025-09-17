import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
    const publicRoutes = ["/sign-in(.*)", "/sign-up(.*)"]; // regex style match

    if (!publicRoutes.some((route) => new RegExp(`^${route}$`).test(req.nextUrl.pathname))) {
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
