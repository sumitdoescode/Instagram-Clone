import { headers } from "next/headers";
import { Webhook } from "svix";
// import { buffer } from "micro";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(req) {
    await connectDB();

    const payload = await req.text();
    const headerPayload = headers();

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;
    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    const { type, data } = evt;

    const { id: clerkId, username, email_addresses, image_url, public_metadata } = data;

    const email = email_addresses?.[0]?.email_address;
    console.log("coming here");
    if (type === "user.created") {
        console.log("coming isnde user.created");
        await User.create({
            clerkId,
            username: username,
            email: email,
            profileImage: {
                url: image_url || "",
            },
        });
    }

    // if (type === "user.updated") {
    //     await User.findOneAndUpdate(
    //         { clerkId: data.id },
    //         {
    //             clerkId: data.id,
    //             email: data.email_addresses[0]?.email_address || "",
    //             username: data.username || data.id,
    //         }
    //     );
    // }

    console.log("coming here too");
    if (type === "user.deleted") {
        console.log("coming here");
        await User.findOneAndDelete({ clerkId });
    }

    return new Response("Webhook received", { status: 200 });
}
