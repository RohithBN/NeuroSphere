"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { IoSquareOutline } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import { MdOutlineNumbers } from "react-icons/md";
import { TbTriangle } from "react-icons/tb";
import { BsVolumeUp, BsVolumeMute } from "react-icons/bs";
import { FaPlay, FaPause } from "react-icons/fa";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Breathing techniques data
const breathingTechniques = [
  {
    id: "box",
    name: "Box Breathing",
    icon: <IoSquareOutline className="w-6 h-6" />,
    description: "Inhale, hold, exhale, and hold - each for 4 counts. Reduces stress and improves concentration.",
    pattern: {
      inhale: 4,
      inhaleHold: 4,
      exhale: 4,
      exhaleHold: 4,
      cycles: 5,
    },
    gradient: "from-purple-600/30 to-indigo-900/30",
    accentColor: "bg-purple-900",
  },
  {
    id: "478",
    name: "4-7-8 Technique",
    icon: <MdOutlineNumbers className="w-6 h-6" />,
    description: "Inhale for 4 seconds, hold for 7, exhale for 8. Promotes relaxation and helps with anxiety and sleep.",
    pattern: {
      inhale: 4,
      inhaleHold: 7,
      exhale: 8,
      exhaleHold: 0,
      cycles: 4,
    },
    gradient: "from-teal-600/30 to-blue-900/30",
    accentColor: "bg-teal-900",
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    icon: <FaRegCircle className="w-5 h-5" />,
    description: "Simple 5-second inhale, 5-second exhale. Balances the autonomic nervous system.",
    pattern: {
      inhale: 5,
      inhaleHold: 0,
      exhale: 5,
      exhaleHold: 0,
      cycles: 6,
    },
    gradient: "from-amber-600/30 to-orange-900/30",
    accentColor: "bg-amber-900",
  },
  {
    id: "triangle",
    name: "Triangle Breathing",
    icon: <TbTriangle className="w-6 h-6" />,
    description: "Inhale, hold, and exhale - each for equal counts. Promotes mindfulness and calm.",
    pattern: {
      inhale: 4,
      inhaleHold: 4,
      exhale: 4,
      exhaleHold: 0,
      cycles: 5,
    },
    gradient: "from-blue-600/30 to-sky-900/30",
    accentColor: "bg-blue-900",
  }
];

// Background music options
const musicOptions = [
  {
    id: "none",
    name: "No Music",
  },
  {
    id: "ambient",
    name: "Ambient Space",
    src: "/music/ambient.mp3",
  },
  {
    id: "meditation",
    name: "Deep Meditation",
    src: "/music/meditation.mp3",
  },
  {
    id: "rain",
    name: "Gentle Rain",
    src: "/music/rain.mp3",
  },
  {
    id: "forest",
    name: "Forest Sounds",
    src: "/music/forest.mp3",
  }
];

export default function BreathingCenter() {
  const { user, isLoading } = useAuth();
    const router = useRouter();
  
    if(!user){
      router.push("/login");
    }
  const [selectedTechnique, setSelectedTechnique] = useState(breathingTechniques[0]);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("ready");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(musicOptions[0]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicPanelOpen, setIsMusicPanelOpen] = useState(false);
  const [isTechniqueMenuOpen, setIsTechniqueMenuOpen] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  // Start breathing session
  const startBreathing = () => {
    setIsBreathingActive(true);
    setBreathingPhase("inhale");
    setTimeLeft(selectedTechnique.pattern.inhale);
    setCurrentCycle(1);
    setShowInstructions(false);

    // Play music if selected
    if (selectedMusic.id !== "none" && audioRef.current) {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  };

  // Reset breathing session
  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathingPhase("ready");
    setTimeLeft(0);
    setCurrentCycle(1);
    setShowInstructions(true);

    // Pause music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  };

  // Toggle music play/pause
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  // Select music option
  const selectMusic = (music: typeof musicOptions[0]) => {
    const wasPlaying = isMusicPlaying;
    
    // Pause current music if playing
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.pause();
    }
    
    setSelectedMusic(music);
    
    // If new selection isn't "none" and music was playing before, play the new selection
    if (music.id !== "none" && wasPlaying && audioRef.current) {
      // Need setTimeout to allow audio src to update
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsMusicPlaying(true);
        }
      }, 100);
    } else {
      setIsMusicPlaying(false);
    }
  };

  // Handle technique change
  const changeTechnique = (technique: typeof breathingTechniques[0]) => {
    if (isBreathingActive) {
      resetBreathing();
    }
    setSelectedTechnique(technique);
    setIsTechniqueMenuOpen(false);
  };

  // Timer effect for breathing phases
  useEffect(() => {
    if (!isBreathingActive || breathingPhase === "ready" || breathingPhase === "completed") {
      return;
    }

    // Animation for the circle
    if (circleRef.current) {
      if (breathingPhase === "inhale") {
        circleRef.current.style.transform = "scale(1.0)";
      } else if (breathingPhase === "exhale") {
        circleRef.current.style.transform = "scale(0.5)";
      }
    }

    const timer = setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else {
        // Move to next phase
        switch (breathingPhase) {
          case "inhale":
            if (selectedTechnique.pattern.inhaleHold > 0) {
              setBreathingPhase("inhaleHold");
              setTimeLeft(selectedTechnique.pattern.inhaleHold);
            } else {
              setBreathingPhase("exhale");
              setTimeLeft(selectedTechnique.pattern.exhale);
            }
            break;
          case "inhaleHold":
            setBreathingPhase("exhale");
            setTimeLeft(selectedTechnique.pattern.exhale);
            break;
          case "exhale":
            if (selectedTechnique.pattern.exhaleHold > 0) {
              setBreathingPhase("exhaleHold");
              setTimeLeft(selectedTechnique.pattern.exhaleHold);
            } else {
              // Check if cycles are complete
              if (currentCycle < selectedTechnique.pattern.cycles) {
                setCurrentCycle(currentCycle + 1);
                setBreathingPhase("inhale");
                setTimeLeft(selectedTechnique.pattern.inhale);
              } else {
                setBreathingPhase("completed");
                setCompletedSessions(prev => prev + 1);
                
                // Auto stop music if it was started by the session
                if (isBreathingActive && audioRef.current) {
                  audioRef.current.pause();
                  setIsMusicPlaying(false);
                }
              }
            }
            break;
          case "exhaleHold":
            // Check if cycles are complete
            if (currentCycle < selectedTechnique.pattern.cycles) {
              setCurrentCycle(currentCycle + 1);
              setBreathingPhase("inhale");
              setTimeLeft(selectedTechnique.pattern.inhale);
            } else {
              setBreathingPhase("completed");
              setCompletedSessions(prev => prev + 1);
              
              // Auto stop music if it was started by the session
              if (isBreathingActive && audioRef.current) {
                audioRef.current.pause();
                setIsMusicPlaying(false);
              }
            }
            break;
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isBreathingActive, breathingPhase, timeLeft, currentCycle, selectedTechnique]);

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalCycles = selectedTechnique.pattern.cycles;
    const cycleProgress = (currentCycle - 1) / totalCycles;
    
    // Calculate progress within current cycle
    let phaseProgress = 0;
    const currentPhaseTotal = selectedTechnique.pattern[breathingPhase as keyof typeof selectedTechnique.pattern] as number;
    
    if (currentPhaseTotal > 0) {
      phaseProgress = (currentPhaseTotal - timeLeft) / currentPhaseTotal / totalCycles;
    }
    
    return (cycleProgress + phaseProgress) * 100;
  };

  // Get instruction text based on current phase
  const getInstructionText = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Inhale slowly";
      case "inhaleHold":
        return "Hold your breath";
      case "exhale":
        return "Exhale slowly";
      case "exhaleHold":
        return "Hold your breath";
      case "completed":
        return "Session complete";
      default:
        return "Get ready";
    }
  };
  
  // Get animation settings for the breathing circle
  const getCircleAnimation = () => {
    switch (breathingPhase) {
      case "inhale":
        return {
          scale: [1, 1.5],
          transition: { duration: selectedTechnique.pattern.inhale }
        };
      case "exhale":
        return {
          scale: [1.5, 1],
          transition: { duration: selectedTechnique.pattern.exhale }
        };
      case "inhaleHold":
      case "exhaleHold":
        return {
          scale: breathingPhase === "inhaleHold" ? 1.5 : 1,
          transition: { duration: 0.1 }
        };
      default:
        return {
          scale: 1,
          transition: { duration: 0.5 }
        };
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] pt-24 pb-16 px-4 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 opacity-20 bg-gradient-radial ${selectedTechnique.gradient}`}></div>
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-gradient-radial from-gray-800/20 to-transparent rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-gradient-radial from-gray-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Breathing Center
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
              Scientifically proven breathing techniques to calm your mind, reduce anxiety, and improve focus.
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Technique Selector (Mobile: above) */}
            <div className="lg:col-span-1 order-1 lg:order-1">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full">
                {/* Mobile View: Dropdown */}
                <div className="lg:hidden mb-4">
                  <button 
                    onClick={() => setIsTechniqueMenuOpen(!isTechniqueMenuOpen)}
                    className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      {selectedTechnique.icon}
                      <span className="text-white">{selectedTechnique.name}</span>
                    </div>
                    <HiOutlineMenuAlt2 className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <AnimatePresence>
                    {isTechniqueMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 bg-black/80 border border-white/10 rounded-lg overflow-hidden"
                      >
                        {breathingTechniques.map((technique) => (
                          <button
                            key={technique.id}
                            onClick={() => changeTechnique(technique)}
                            className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-white/5 transition-colors ${
                              selectedTechnique.id === technique.id ? "bg-white/10" : ""
                            }`}
                          >
                            <div className="text-white">{technique.icon}</div>
                            <span className="text-white">{technique.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Desktop View: Vertical List */}
                <div className="hidden lg:block">
                  <h2 className="text-xl font-semibold text-white mb-4">Breathing Techniques</h2>
                  <div className="space-y-3">
                    {breathingTechniques.map((technique) => (
                      <button
                        key={technique.id}
                        onClick={() => changeTechnique(technique)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                          selectedTechnique.id === technique.id
                            ? "bg-white/10 border border-white/20"
                            : "hover:bg-white/5 border border-white/5"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full ${technique.accentColor} bg-opacity-20 flex items-center justify-center`}>
                          <div className="text-white">{technique.icon}</div>
                        </div>
                        <span className="text-white">{technique.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <h3 className="text-gray-400 text-sm font-medium mb-3">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Today's Sessions</div>
                      <div className="text-white text-xl font-bold">{completedSessions}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Minutes Practiced</div>
                      <div className="text-white text-xl font-bold">{Math.floor(completedSessions * 3.5)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Music Controls - Mobile Only */}
                <div className="lg:hidden mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-400 text-sm font-medium">Background Music</h3>
                    <button 
                      onClick={() => setIsMusicPanelOpen(!isMusicPanelOpen)}
                      className="text-white hover:text-gray-300"
                    >
                      {isMusicPanelOpen ? "Close" : "Change"}
                    </button>
                  </div>
                  
                  {/* Current Music Display */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-white">{selectedMusic.name}</div>
                    {selectedMusic.id !== "none" && (
                      <button 
                        onClick={toggleMusic} 
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        {isMusicPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white ml-0.5" />}
                      </button>
                    )}
                  </div>
                  
                  {/* Music Selection Panel */}
                  <AnimatePresence>
                    {isMusicPanelOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="space-y-2">
                          {musicOptions.map((music) => (
                            <button
                              key={music.id}
                              onClick={() => selectMusic(music)}
                              className={`w-full p-2 rounded text-left text-sm transition-colors ${
                                selectedMusic.id === music.id
                                  ? "bg-white/10 text-white"
                                  : "text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              {music.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Center Panel - Breathing Visualization */}
            <div className="lg:col-span-1 order-3 lg:order-2">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {/* Technique Name */}
                  <h2 className="text-2xl font-semibold text-white mb-4 text-center">
                    {selectedTechnique.name}
                  </h2>
                  
                  {/* Visualization Circle */}
                  <div className="relative flex items-center justify-center my-8 w-full">
                    {/* Progress ring */}
                    <div 
                      className="absolute w-64 h-64 rounded-full border-2 border-white/10"
                      style={{
                        background: isBreathingActive 
                          ? `conic-gradient(from 0deg, ${selectedTechnique.accentColor.replace('bg-', '')} 0%, ${selectedTechnique.accentColor.replace('bg-', '')} ${calculateProgress()}%, transparent ${calculateProgress()}%, transparent 100%)`
                          : 'transparent'
                      }}
                    ></div>
                    
                    {/* Breathing circle */}
                    <motion.div
                      ref={circleRef}
                      className={`w-56 h-56 rounded-full ${selectedTechnique.accentColor} bg-opacity-10 border border-white/20 flex items-center justify-center transition-all`}
                      animate={getCircleAnimation()}
                    >
                      {breathingPhase === "completed" ? (
                        <div className="text-center">
                          <div className="text-2xl text-white mb-2">✓</div>
                          <div className="text-white font-semibold">Complete</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl text-white font-light">{timeLeft}</div>
                          <div className="text-gray-400 mt-2 text-sm">{getInstructionText()}</div>
                          {isBreathingActive && (
                            <div className="text-gray-500 mt-1 text-xs">
                              Cycle {currentCycle} of {selectedTechnique.pattern.cycles}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Controls */}
                  <div className="w-full max-w-xs">
                    {isBreathingActive ? (
                      <button
                        onClick={resetBreathing}
                        className="w-full py-3 px-6 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
                      >
                        {breathingPhase === "completed" ? "Start New Session" : "End Session"}
                      </button>
                    ) : (
                      <button
                        onClick={startBreathing}
                        className="w-full py-3 px-6 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
                      >
                        Begin {selectedTechnique.name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Technique Info & Music (Desktop) */}
            <div className="lg:col-span-1 order-2 lg:order-3">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full">
                <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
                
                {/* Technique Description */}
                <p className="text-gray-400 text-sm mb-6">
                  {selectedTechnique.description}
                </p>
                
                {/* Pattern Details */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Inhale</span>
                    <span className="text-white text-sm">{selectedTechnique.pattern.inhale} seconds</span>
                  </div>
                  {selectedTechnique.pattern.inhaleHold > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Hold after inhale</span>
                      <span className="text-white text-sm">{selectedTechnique.pattern.inhaleHold} seconds</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Exhale</span>
                    <span className="text-white text-sm">{selectedTechnique.pattern.exhale} seconds</span>
                  </div>
                  {selectedTechnique.pattern.exhaleHold > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Hold after exhale</span>
                      <span className="text-white text-sm">{selectedTechnique.pattern.exhaleHold} seconds</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Total Cycles</span>
                    <span className="text-white text-sm">{selectedTechnique.pattern.cycles}</span>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="mb-8">
                  <h3 className="text-white font-medium mb-2">Benefits</h3>
                  <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                    <li>Reduces stress and anxiety</li>
                    <li>Improves focus and concentration</li>
                    <li>Calms the nervous system</li>
                    <li>Helps with emotional regulation</li>
                  </ul>
                </div>
                
                {/* Music Controls - Desktop Only */}
                <div className="hidden lg:block mt-8 pt-6 border-t border-white/5">
                <h3 className="text-white font-medium mb-3">Background Music</h3>
                
                <div className="space-y-3 mb-4">
                    {musicOptions.map((music) => (
                    <div
                        key={music.id}
                        className={`flex items-center justify-between w-full p-2 rounded text-left text-sm transition-colors ${
                        selectedMusic.id === music.id
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                        <span 
                        className="flex-1 cursor-pointer" 
                        onClick={() => selectMusic(music)}
                        >
                        {music.name}
                        </span>
                        {selectedMusic.id === music.id && music.id !== "none" && (
                        <span
                            onClick={toggleMusic}
                            className="text-white hover:text-gray-300 cursor-pointer"
                        >
                            {isMusicPlaying ? <BsVolumeUp /> : <BsVolumeMute />}
                        </span>
                        )}
                    </div>
                    ))}
                </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mt-12 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tips for Effective Breathing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-white font-medium mb-2">Find a Quiet Space</h3>
                <p className="text-gray-400 text-sm">Practice in a quiet, comfortable environment free from distractions.</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Comfortable Position</h3>
                <p className="text-gray-400 text-sm">Sit or lie in a relaxed position with your spine straight and shoulders relaxed.</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Breathe Naturally</h3>
                <p className="text-gray-400 text-sm">Don't force your breath. The goal is to breathe deeply but comfortably.</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Regular Practice</h3>
                <p className="text-gray-400 text-sm">Aim for 5-10 minutes daily for the best results and long-term benefits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Element */}
      {selectedMusic.id !== "none" && (
        <audio 
          ref={audioRef}
          src={selectedMusic.src}
          loop
        />
      )}
    </>
  );
}