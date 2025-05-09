// route to fetch user gender and age

import { db } from "@/lib/firebase";
import { collection, getDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

// Define types for better code clarity
interface UserContextRequest {
  userId: string;
}

interface UserContextResponse {
  age?: number;
  gender?: string;
}

export async function POST(request: Request) {
    let userId: string;
    try {
        const body = await request.json() as UserContextRequest;
        userId = body.userId;
    } catch (error) {
        console.error("Error parsing JSON body:", error);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ error: "userId is missing in request body" }, { status: 400 });
    }

    try {
        console.log("Fetching user data for userId:", userId);
        // fetch userContext from database from user collection
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userSnap.data();
        console.log("Retrieved user data:", userData);
        
        const userContext: UserContextResponse = {
            age: userData.age || null,
            gender: userData.gender || null
        };
        
        return NextResponse.json(userContext, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching user data from Firestore:", error);
        if (error instanceof Error && 'code' in error && error.code === 'invalid-argument') {
             return NextResponse.json({ error: "Invalid userId for Firestore query" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 });
    }
}