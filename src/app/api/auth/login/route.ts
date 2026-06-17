import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const users = await prisma.users.findMany();
        return NextResponse.json({ message: "Users fetched successfully", data: users }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { message: "Error fetching users", error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
