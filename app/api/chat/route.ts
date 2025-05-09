import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const {userId, message, gender, age} = body;
    
    const response = await fetch("https://psychologist-api.onrender.com/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: userId, // Changed from userId to user_id to match API schema
            message: message,
            gender: gender,
            age: age
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        return NextResponse.json({ error: "Error fetching data from external API" }, { status: 500 });
    }
    if (data.error) {
        return NextResponse.json({ error: data.error }, { status: 500 });
    }
    
    // Pass along both response and audio_base64 from the API
    return NextResponse.json({ 
        response: data.response,
        audio_base64: data.audio_base64 
    }, { status: 200 });
}