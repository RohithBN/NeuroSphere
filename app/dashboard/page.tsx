"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { MdOutlinePsychology } from "react-icons/md";
import { RiLungsFill } from "react-icons/ri";
import { TbMoodSearch } from "react-icons/tb";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { GiNightSleep } from "react-icons/gi";
import { GiMeditation } from "react-icons/gi";

export default function Dashboard() {
  const { user, isLoading, userProfile } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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

  // Main dashboard content
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">{userProfile?.name || user.email?.split("@")[0]}</span>
            </h1>
            <p className="text-gray-400 mt-2">Let's continue your mental wellness journey today.</p>
          </div>

          {/* Recommended For You */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">Recommended For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Therapy Session */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <MdOutlinePsychology className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">AI Therapy Session</h3>
                      <p className="text-gray-400 text-sm">30 min • Personalized</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Your daily check-in with your AI therapist based on your recent mood patterns.</p>
                  <Link href="/therapist" className="text-white bg-white/10 hover:bg-white/15 transition-colors py-2 px-4 rounded-lg inline-flex items-center text-sm">
                    Start Session
                  </Link>
                </div>
              </div>

              {/* Breathing Exercise */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <RiLungsFill className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Calm Breathing</h3>
                      <p className="text-gray-400 text-sm">10 min • Focus</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">A guided breathing exercise to help reduce anxiety and improve focus.</p>
                  <Link href="/breathing" className="text-white bg-white/10 hover:bg-white/15 transition-colors py-2 px-4 rounded-lg inline-flex items-center text-sm">
                    Begin Exercise
                  </Link>
                </div>
              </div>

              {/* Journal Entry */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <BsFillJournalBookmarkFill className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Evening Reflection</h3>
                      <p className="text-gray-400 text-sm">5 min • Guided</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Take a moment to reflect on your day and process your experiences.</p>
                  <Link href="/journal" className="text-white bg-white/10 hover:bg-white/15 transition-colors py-2 px-4 rounded-lg inline-flex items-center text-sm">
                    Write Entry
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Focus */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Focus Areas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/meditate" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-all">
                    <GiMeditation className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-sm font-medium">Meditation</h3>
                  <p className="text-gray-500 text-xs mt-1">10 min session</p>
                </div>
              </Link>
              <Link href="/sleep-tracker" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-all">
                    <GiNightSleep className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-sm font-medium">Sleep Analysis</h3>
                  <p className="text-gray-500 text-xs mt-1">View insights</p>
                </div>
              </Link>
              <Link href="/mood-tracker" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-all">
                    <TbMoodSearch className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-sm font-medium">Mood Check</h3>
                  <p className="text-gray-500 text-xs mt-1">Log your mood</p>
                </div>
              </Link>
              <Link href="/focus" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-all">
                    <GiMeditation className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-sm font-medium">Focus Session</h3>
                  <p className="text-gray-500 text-xs mt-1">Improve clarity</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Weekly Insights */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Weekly Insights</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-gray-300 text-sm font-medium mb-3">Mood Pattern</h3>
                <div className="bg-white/5 rounded-xl p-4 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Mood visualization would appear here</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-300 text-sm font-medium mb-3">Sleep Quality</h3>
                <div className="bg-white/5 rounded-xl p-4 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Sleep graph would appear here</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                Your overall wellness score is improving. Continue with your daily mindfulness exercises for best results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}