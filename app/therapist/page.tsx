'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'
import Navbar from "@/components/Navbar";
import { MdOutlinePsychology } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { BiSolidVolumeFull } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

// Renamed to follow React component naming convention
const TherapistPage = () => {
    type UserData = {
        age?: number;
        gender?: string;
    }
    const { user, isLoading, userProfile } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    console.log("User profile is available:", userProfile);
            
    const router = useRouter();
    const [userData, setUserData] = useState<UserData>({});
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string, audio_base64?: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [showFeedbackConfirmation, setShowFeedbackConfirmation] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        // Fetch user context only when userProfile is available
        const fetchUserContext = async () => {
            if (!userProfile?.uid) return;
            console.log("User profile is available:", userProfile);
            
            try {
                setApiError("");
                console.log("Fetching user context for user ID:", userProfile.uid);
                
                const res = await fetch("/api/userContext", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: userProfile.uid
                    })
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `API returned status: ${res.status}`);
                }
                
                const data = await res.json();
                setUserData(data);
                console.log("userContextData: ", data);
            } catch (error: any) {
                console.error("Failed to fetch user context:", error);
                setApiError(`Failed to load your profile data: ${error.message}`);
            }
        };
        
        fetchUserContext();
    }, [userProfile]);

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    if (isLoading) {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
          </div>
        );
    }
    
    if (!user) {
        return null; // Will redirect in useEffect
    }

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        
        // Add user message to chat
        const userMessage = { role: 'user', content: prompt };
        setMessages(prev => [...prev, userMessage]);
        
        // Clear input and set loading
        const userPrompt = prompt;
        setPrompt("");
        setLoading(true);
        
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user?.uid,
                    message: userPrompt,
                    gender: userData?.gender,
                    age: userData?.age
                })
            });
            
            if (!res.ok) {
                throw new Error(`API returned status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("message from LLM", data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Add assistant response to chat with audio_base64 if available
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: data.response || "Sorry, I couldn't process your request.",
                audio_base64: data.audio_base64
            }]);
    
            
        } catch (error) {
            console.error("Error in chat API:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, there was an error processing your request. Please try again." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = async (feedbackType: string) => {
        setFeedback(feedbackType);
        
        try {
          console.log("Sending feedback:", feedbackType);
      
          const res = await fetch("/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_id: user?.uid,
              feedback: feedbackType
            })
          });
      
          const data = await res.json();
          console.log("Feedback data:", data);
      
          if (res.ok) {
            setFeedbackGiven(true);
            setShowFeedbackConfirmation(true);
            // Hide confirmation after 2 seconds
            setTimeout(() => setShowFeedbackConfirmation(false), 2000);
          } else {
            throw new Error(data.error || `API returned status: ${res.status}`);
          }
        } catch (error) {
          console.error("Error in feedback API:", error);
          setApiError("Failed to submit feedback. Please try again.");
          setFeedbackGiven(false);
        }
    }
      

    return (
        <>
            <Navbar />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="pt-24 pb-16 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] min-h-screen"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Session Header */}
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 3,
                                        ease: "easeInOut" 
                                    }}
                                >
                                    <MdOutlinePsychology className="w-7 h-7 text-white" />
                                </motion.div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Your Therapy Session</h1>
                                <p className="text-gray-400 text-sm mt-1">AI-powered therapy assistant for your mental wellness</p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <AnimatePresence>
                        {apiError && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                            >
                                {apiError}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Chat Container */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl mb-6 p-6 min-h-[400px] max-h-[600px] overflow-y-auto"
                        ref={chatContainerRef}
                    >
                        {messages.length === 0 ? (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex flex-col items-center justify-center h-64 text-center"
                            >
                                <motion.div 
                                    animate={{ 
                                        boxShadow: ["0px 0px 0px rgba(255,255,255,0.1)", "0px 0px 20px rgba(255,255,255,0.2)", "0px 0px 0px rgba(255,255,255,0.1)"]
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 4,
                                    }}
                                    className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"
                                >
                                    <MdOutlinePsychology className="w-9 h-9 text-gray-400" />
                                </motion.div>
                                <p className="text-gray-400">Start your conversation with the AI therapist</p>
                                <p className="text-gray-500 text-sm mt-2">Share your thoughts or concerns to begin</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {messages.map((msg, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ 
                                                opacity: 0, 
                                                x: msg.role === 'user' ? 20 : -20,
                                                scale: 0.95
                                            }}
                                            animate={{ 
                                                opacity: 1, 
                                                x: 0,
                                                scale: 1
                                            }}
                                            transition={{ 
                                                duration: 0.3,
                                                delay: 0.1 * index % 3 // Avoid too much delay for older messages
                                            }}
                                            className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                                        >
                                            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                                msg.role === 'user' 
                                                    ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-tr-none shadow-lg border border-white/5' 
                                                    : 'bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 rounded-tl-none shadow-lg border border-white/5'
                                            }`}>
                                                <div className="text-sm">{msg.content}</div>
                                                
                                
                       
                                                {/* Redesigned Feedback UI */}
                                                {!feedbackGiven && msg.role !== "user" && (
                                                    <div className="mt-3 border-t border-white/5 pt-2">
                                                        <p className="text-xs text-gray-400 mb-2">How was this response?</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <AnimatePresence>
                                                                {showFeedbackConfirmation ? (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        className="text-xs text-green-400"
                                                                    >
                                                                        Thank you for your feedback!
                                                                    </motion.div>
                                                                ) : (
                                                                    <>
                                                                        <motion.button 
                                                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleFeedback("helpful")}
                                                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <span className="text-green-400">●</span> Helpful
                                                                        </motion.button>
                                                                        
                                                                        <motion.button 
                                                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleFeedback("more_empathy")}
                                                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <span className="text-blue-400">●</span> More Empathy
                                                                        </motion.button>
                                                                        
                                                                        <motion.button 
                                                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleFeedback("more_practical")}
                                                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <span className="text-purple-400">●</span> More Practical
                                                                        </motion.button>
                                                                        
                                                                        <motion.button 
                                                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => handleFeedback("not_helpful")}
                                                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <span className="text-red-400">●</span> Not Helpful
                                                                        </motion.button>
                                                                    </>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1`}>
                                                {msg.role === 'user' ? 'You' : 'AI Therapist'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                {loading && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-3 bg-gray-900/60 rounded-lg max-w-fit border border-white/5 mt-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-7 h-7">
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.7, 1, 0.7],
                                                        rotate: [0, 360]
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="absolute inset-0 rounded-full border-2 border-t-white/30 border-r-white/30 border-b-white/10 border-l-white/10"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full opacity-50"></div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400">Processing your message...</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                    
                    {/* Input Form */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-lg"
                    >
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <motion.input
                                whileFocus={{ boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.1)" }}
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:outline-none transition-shadow duration-300"
                            />
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="bg-gradient-to-r from-gray-100 to-gray-300 text-black py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <span>Send</span>
                                <motion.div
                                    animate={loading ? { y: [0, -3, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <IoSend className="w-4 h-4" />
                                </motion.div>
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}

export default TherapistPage;