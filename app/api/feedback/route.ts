import { NextResponse } from "next/server";


export async function POST(request: Request) {
    const body= await request.json();
    const {user_id,feedback}= body;
    console.log("Received feedback:", body);

    try {
        const response=await fetch("https://psychologist-api.onrender.com/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user_id,
                feedback: feedback
            })
        });
        const data= await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: "Error fetching data from external API" }, { status: 500 });
        }
        if (data.error) {
            return NextResponse.json({ error: data.error }, { status: 500 });
        }
        console.log("Feedback response:", data);
        return NextResponse.json({
            message:"Feedback submitted successfully",
            status: data.status,

        })
     }
      catch (error) {
        console.error("Error fetching data from external API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}