"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FiHeart, FiShare2, FiBookmark, FiRefreshCw, FiImage 
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

// Types for the meme API response
interface Meme {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview: string[];
}

// Categories for meme filtering
const memeCategories = [
  "wholesome",
  "mindfulness",
  "motivation",
  "meditation",
  "wellness",
  "positivity"
];

export default function Memes() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // States
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Fetch initial meme
  useEffect(() => {
    fetchNewMeme();
  }, []);

  // Fetch a new meme from the API
  const fetchNewMeme = async () => {
    try {
      setLoadingNew(true);
      setImageLoaded(false);
      const response = await fetch("https://meme-api.com/gimme");
      const data: Meme = await response.json();
      
      // Filter out NSFW content
      if (data.nsfw) {
        return fetchNewMeme();
      }
      
      setCurrentMeme(data);
      setError("");
    } catch (error) {
      console.error("Error fetching meme:", error);
      setError("Failed to load meme. Please try again.");
    } finally {
      setLoadingNew(false);
      setLoading(false);
    }
  };

  // Save/unsave meme
  const toggleSaveMeme = () => {
    if (!currentMeme) return;
    
    setSavedMemes(prev => {
      const isSaved = prev.some(meme => meme.url === currentMeme.url);
      if (isSaved) {
        return prev.filter(meme => meme.url !== currentMeme.url);
      } else {
        return [...prev, currentMeme];
      }
    });
  };

  // Share meme
  const shareMeme = async () => {
    if (!currentMeme) return;
    
    try {
      await navigator.share({
        title: currentMeme.title,
        text: `Check out this meme from ${currentMeme.subreddit}`,
        url: currentMeme.postLink
      });
    } catch (error) {
      console.error("Error sharing meme:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] pt-24 pb-16 px-4 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 opacity-20 bg-gradient-radial from-purple-900/20 to-transparent"></div>
          <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-gradient-radial from-pink-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-gradient-radial from-blue-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Mental Memes
            </h1>
            <p className="text-gray-400 mt-2">
              Take a mindful break with curated memes that bring joy and perspective
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Meme Display */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <FiImage className="w-12 h-12 text-gray-500 mb-3" />
                  <p className="text-gray-400">{error}</p>
                  <button
                    onClick={fetchNewMeme}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : currentMeme && (
                <div className="space-y-4">
                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-medium">{currentMeme.title}</h2>
                    <span className="text-gray-400 text-sm">r/{currentMeme.subreddit}</span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-video bg-black/20 rounded-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      {!imageLoaded && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Image
                      src={currentMeme.url}
                      alt={currentMeme.title}
                      fill
                      className={`object-contain transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
                        <FiHeart />
                        <span className="text-sm">{currentMeme.ups.toLocaleString()}</span>
                      </button>
                      <button
                        onClick={toggleSaveMeme}
                        className={`flex items-center gap-2 transition-colors ${
                          savedMemes.some(meme => meme.url === currentMeme.url)
                            ? 'text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      >
                        <FiBookmark />
                      </button>
                      <button
                        onClick={shareMeme}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <FiShare2 />
                      </button>
                    </div>
                    <button
                      onClick={fetchNewMeme}
                      disabled={loadingNew}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white transition-all ${
                        loadingNew ? 'opacity-70' : ''
                      }`}
                    >
                      {loadingNew ? (
                        <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
                      ) : (
                        <FiRefreshCw className={loadingNew ? 'animate-spin' : ''} />
                      )}
                      Next Meme
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Memes */}
            {savedMemes.length > 0 && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Saved Memes</h2>
                  <span className="text-gray-400 text-sm">
                    {savedMemes.length} {savedMemes.length === 1 ? 'meme' : 'memes'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {savedMemes.map((meme, index) => (
                    <div
                      key={index}
                      className="relative aspect-video bg-black/20 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={meme.url}
                        alt={meme.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm text-center px-2 line-clamp-2">
                          {meme.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}