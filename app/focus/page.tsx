"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { 
  BsLightningCharge, BsPuzzle, BsSpeedometer 
} from "react-icons/bs";
import { GiBrain, GiPuzzle } from "react-icons/gi";
import { TbBrain } from "react-icons/tb";
import Navbar from "../../components/Navbar";
import Link from "next/link";

// Types for activities
interface Activity {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  type: "game" | "exercise" | "challenge";
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link: string; 
}

// Mini-games and activities data
const activities: Activity[] = [
  {
    id: "memory-tiles",
    name: "Memory Tiles",
    description: "Test and improve your memory by matching pairs of tiles",
    icon: <GiPuzzle className="w-6 h-6" />,
    color: "from-purple-600 to-indigo-600",
    type: "game",
    duration: "5-10 min",
    difficulty: "Medium",
    link:"https://www.improvememory.org/wp-content/games/memory-game/index.html"
  },
  {
    id: "pattern-recall",
    name: "Pattern Recall",
    description: "Remember and repeat increasingly complex patterns",
    icon: <BsPuzzle className="w-6 h-6" />,
    color: "from-blue-600 to-cyan-600",
    type: "game",
    duration: "3-5 min",
    difficulty: "Easy",
    link:"https://www.improvememory.org/wp-content/games/patternmemory_e_fullscreen.htm"
  },
  {
    id: "reaction-test",
    name: "Reaction Time",
    description: "Test your reflexes and improve reaction speed",
    icon: <BsLightningCharge className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    type: "game",
    duration: "2-3 min",
    difficulty: "Easy",
    link:"https://humanbenchmark.com/tests/reactiontime"
  },
  {
    id: "mindful-maze",
    name: "Mindful Slider",
    description: "Solve through a slider while practicing mindfulness",
    icon: <GiBrain className="w-6 h-6" />,
    color: "from-green-600 to-emerald-600",
    type: "exercise",
    duration: "5-8 min",
    difficulty: "Medium",
    link:"https://www.improvememory.org/wp-content/games/slide/index.html"
  },
  {
    id: "focus-flow",
    name: "Focus Flow",
    description: "Follow the moving object while maintaining concentration",
    icon: <BsSpeedometer className="w-6 h-6" />,
    color: "from-pink-600 to-rose-600",
    type: "exercise",
    duration: "3-5 min",
    difficulty: "Medium",
    link:"https://www.improvememory.org/wp-content/games/trickycups_e_fullscreen.htm"
  },
  {
    id: "word-chains",
    name: "Word Chains",
    description: "Build chains of related words to enhance cognitive flexibility",
    icon: <TbBrain className="w-6 h-6" />,
    color: "from-teal-600 to-cyan-600",
    type: "game",
    duration: "5-10 min",
    difficulty: "Hard",
    link:"https://www.improvememory.org/wp-content/games/word-game/index.html"
  }
];

// Focus music playlists
const focusPlaylists = [
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Ambient sounds for deep concentration",
    duration: "2 hours",
    tracks: ["Deep Flow", "Mind Space", "Cosmic Focus", "Neural Rhythm"]
  },
  {
    id: "study-beats",
    name: "Study Beats",
    description: "Lo-fi beats for productive study sessions",
    duration: "1.5 hours",
    tracks: ["Midnight Code", "Library Vibes", "Chill Study", "Focus Beat"]
  },
  {
    id: "nature-sounds",
    name: "Nature Sounds",
    description: "Calming nature ambiance for relaxed focus",
    duration: "1 hour",
    tracks: ["Forest Rain", "Ocean Waves", "Mountain Stream", "Bird Songs"]
  }
];

export default function FocusSpace() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if(!user){
    router.push("/login");
  }

  // States
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(focusPlaylists[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<"all" | "game" | "exercise">("all");

  // Audio ref for music player
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Filter activities
  const filteredActivities = currentFilter === "all" 
    ? activities
    : activities.filter(activity => activity.type === currentFilter);

  // Handle activity selection
  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  // Start activity
  const startActivity = () => {
    if (!selectedActivity) return;
    
    setActiveGame(selectedActivity.id);
    setShowModal(false);
    // Initialize game state based on activity type
    initializeGameState(selectedActivity.id);
  };

  // Initialize game state
  const initializeGameState = (gameId: string) => {
    switch (gameId) {
      case "memory-tiles":
        // Initialize memory tiles game
        break;
      case "pattern-recall":
        // Initialize pattern recall game
        break;
      // Add more game initializations
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
          <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-gradient-radial from-blue-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-gradient-radial from-indigo-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Focus Space
            </h1>
            <p className="text-gray-400 mt-2">
              Enhance your focus through engaging games and mindful exercises
            </p>
          </div>

          {/* Activity Filters */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-full border border-white/10 p-1">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentFilter("all")}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    currentFilter === "all"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Activities
                </button>
                <button
                  onClick={() => setCurrentFilter("game")}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    currentFilter === "game"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Games
                </button>
                <button
                  onClick={() => setCurrentFilter("exercise")}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    currentFilter === "exercise"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Exercises
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activities Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity)}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                        {activity.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{activity.name}</h3>
                        <p className="text-gray-400 text-sm">{activity.duration}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                        {activity.difficulty}
                      </span>
                      <span className="text-white text-sm">Start →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Music Player & Stats */}
            <div className="space-y-6">
              {/* Music Player */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Focus Music</h2>
                <div className="space-y-4">
                  {focusPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`p-4 rounded-xl transition-all ${
                        selectedPlaylist.id === playlist.id
                          ? "bg-white/10 border border-white/20"
                          : "bg-white/5 border border-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-medium">{playlist.name}</h3>
                        <span className="text-gray-400 text-sm">{playlist.duration}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{playlist.description}</p>
                      <button
                        onClick={() => {
                          setSelectedPlaylist(playlist);
                          setIsPlaying(!isPlaying);
                        }}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {selectedPlaylist.id === playlist.id && isPlaying
                          ? "Pause"
                          : "Play"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Start Modal */}
      <AnimatePresence>
        {showModal && selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-black/80 rounded-2xl border border-white/10 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedActivity.color} flex items-center justify-center`}>
                    {selectedActivity.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedActivity.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{selectedActivity.duration}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">{selectedActivity.description}</p>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Instructions</h4>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li>Find a quiet place to focus</li>
                    <li>Take a few deep breaths before starting</li>
                    <li>Try to maintain consistent concentration</li>
                    <li>Take breaks if needed</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <Link href={selectedActivity.link}  target="_blank" rel="noopener noreferrer">
                <button
                  onClick={startActivity}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors"
                >
                  Begin Activity
                </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}