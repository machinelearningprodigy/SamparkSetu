import { auth, adminDb } from "@/lib/firebase-admin"
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        const { id, email } = reqBody;

        if (!id || !email) {
            return new NextResponse("Missing ID or Email", { status: 400 });
        }

        const user = await auth.getUserByEmail(email);

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        await adminDb.collection('customers').doc(user.uid).collection('payments').doc(id).update({
            status: 'complete',
        });

        return NextResponse.json({ message: "Payment updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating payment:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
