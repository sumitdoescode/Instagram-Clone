// middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/(.*)", "/account(.*)", "/message(.*)", "/post(.*)", "/profile(.*)", "/search(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
    matcher: [
        // protect all routes except public ones
        "/((?!api|_next|.*\\..*|favicon.ico|sign-in|sign-up).*)",
    ],
};
