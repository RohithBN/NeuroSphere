"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays} from "date-fns";
import { FiMoon, FiSun, FiClock, FiCalendar, FiPlusCircle, FiTrendingUp, FiX } from "react-icons/fi";
import { GiNightSleep, GiSleepy } from "react-icons/gi";
import { RiMoonClearLine } from "react-icons/ri";
import { TbZzz } from "react-icons/tb";
import { BsStars } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";

// Sleep quality options
const qualityOptions = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Very Good" },
  { value: 5, label: "Excellent" }
];

// Mood options
const moodOptions = [
  { value: "refreshed", label: "Refreshed", icon: <GiNightSleep className="w-5 h-5" /> },
  { value: "energized", label: "Energized", icon: <FiSun className="w-5 h-5" /> },
  { value: "tired", label: "Tired", icon: <GiSleepy className="w-5 h-5" /> },
  { value: "groggy", label: "Groggy", icon: <TbZzz className="w-5 h-5" /> },
  { value: "neutral", label: "Neutral", icon: <RiMoonClearLine className="w-5 h-5" /> }
];

// Activity options
const activityOptions = [
  { value: "reading", label: "Reading before bed" },
  { value: "meditation", label: "Meditation" },
  { value: "screen", label: "Screen time" },
  { value: "exercise", label: "Exercise (>2hrs before)" },
  { value: "caffeine", label: "Caffeine" },
  { value: "alcohol", label: "Alcohol" },
  { value: "heavyMeal", label: "Heavy meal" },
  { value: "nap", label: "Daytime nap" }
];

// Tips content
const sleepTips = {
  poor: [
    "Establish a consistent sleep schedule, even on weekends",
    "Create a cool, dark, and quiet sleep environment",
    "Avoid screens at least 1 hour before bedtime",
    "Limit caffeine and alcohol consumption",
    "Try relaxation techniques like deep breathing or meditation before bed"
  ],
  moderate: [
    "Consider light stretching or yoga before bed to release tension",
    "Keep a sleep journal to identify patterns affecting your rest",
    "Ensure your mattress and pillows provide proper support",
    "Avoid heavy meals within 2 hours of bedtime",
    "Try taking a warm bath or shower before bed"
  ],
  good: [
    "You're on the right track! Maintain your healthy sleep habits",
    "For even better sleep, consider adding relaxing activities to your bedtime routine",
    "Keep monitoring your sleep patterns to maintain this quality",
    "Morning sunlight exposure can help reinforce your healthy sleep cycle",
    "Physical activity during the day contributes to better sleep quality"
  ],
};

export default function SleepTracker() {
  const { user, isLoading } = useAuth();
    const router = useRouter();
  
    if(!user){
      router.push("/login");
    }
  
  // States for logging new sleep entry
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [sleepDate, setSleepDate] = useState("");
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // States for sleep data
  const [sleepEntries, setSleepEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [showDetailsFor, setShowDetailsFor] = useState<string | null>(null);
  
  // Calendar selection state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);
  
  // Fetch sleep data on load
  useEffect(() => {
    if (user) {
      fetchSleepData();
    }
  }, [user]);
  
  // Calculate sleep duration from bedTime and wakeTime
  const calculateSleepDuration = (bedTime: string, wakeTime: string) => {
    // Parse times to get hours and minutes
    const [bedHour, bedMinute] = bedTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    
    // Convert to minutes past midnight
    let bedMinutesPastMidnight = bedHour * 60 + bedMinute;
    let wakeMinutesPastMidnight = wakeHour * 60 + wakeMinute;
    
    // Adjust if wake time is earlier (next day)
    if (wakeMinutesPastMidnight < bedMinutesPastMidnight) {
      wakeMinutesPastMidnight += 24 * 60; // Add a day in minutes
    }
    
    // Calculate duration in minutes
    const durationMinutes = wakeMinutesPastMidnight - bedMinutesPastMidnight;
    
    // Convert to hours and minutes
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return { hours, minutes, totalMinutes: durationMinutes };
  };

  // Fetch sleep data from firestore
  const fetchSleepData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const sleepRef = collection(db, "sleepData");
      const q = query(
        sleepRef, 
        where("userId", "==", user.uid),
        orderBy("sleepDate", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const entries: any[] = [];
      
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSleepEntries(entries);
    } catch (error) {
      console.error("Error fetching sleep data:", error);
      setError("Failed to load sleep data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Submit sleep entry form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!sleepDate || !bedTime || !wakeTime) {
      setError("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { hours, minutes, totalMinutes } = calculateSleepDuration(bedTime, wakeTime);
      
      const sleepEntry = {
        userId: user?.uid,
        sleepDate: Timestamp.fromDate(new Date(sleepDate)),
        bedTime,
        wakeTime,
        sleepDuration: {
          hours,
          minutes,
          totalMinutes
        },
        sleepQuality,
        mood: selectedMood,
        activities: selectedActivities,
        notes,
        createdAt: Timestamp.now()
      };
      
      if (isEditMode && editingEntryId) {
        // Update existing entry
        const docRef = doc(db, "sleepData", editingEntryId);
        await updateDoc(docRef, sleepEntry);
      } else {
        // Create new entry
        await addDoc(collection(db, "sleepData"), sleepEntry);
      }
      
      // Reset form and refresh data
      resetForm();
      await fetchSleepData();
      setShowEntryForm(false);
      
    } catch (error) {
      console.error("Error saving sleep entry:", error);
      setError("Failed to save sleep entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a sleep entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this sleep record?")) return;
    
    try {
      await deleteDoc(doc(db, "sleepData", entryId));
      await fetchSleepData();
      setShowDetailsFor(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setError("Failed to delete entry. Please try again.");
    }
  };
  
  // Edit an existing entry
  const handleEditEntry = (entry: any) => {
    setSleepDate(format(entry.sleepDate.toDate(), "yyyy-MM-dd"));
    setBedTime(entry.bedTime);
    setWakeTime(entry.wakeTime);
    setSleepQuality(entry.sleepQuality);
    setSelectedMood(entry.mood);
    setSelectedActivities(entry.activities || []);
    setNotes(entry.notes || "");
    setEditingEntryId(entry.id);
    setIsEditMode(true);
    setShowEntryForm(true);
    setShowDetailsFor(null);
  };
  
  // Reset form fields
  const resetForm = () => {
    setSleepDate(format(new Date(), "yyyy-MM-dd"));
    setBedTime("");
    setWakeTime("");
    setSleepQuality(3);
    setSelectedMood("neutral");
    setSelectedActivities([]);
    setNotes("");
    setIsEditMode(false);
    setEditingEntryId(null);
    setError("");
  };
  
  // Toggle activity selection
  const toggleActivity = (value: string) => {
    setSelectedActivities((prev) => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // Filter data based on selected timeframe
  const filteredSleepData = useMemo(() => {
    if (sleepEntries.length === 0) return [];
    
    const today = new Date();
    let startDate;
    
    switch (selectedTimeframe) {
      case "week":
        startDate = subDays(today, 7);
        break;
      case "month":
        startDate = subDays(today, 30);
        break;
      case "3months":
        startDate = subDays(today, 90);
        break;
      case "year":
        startDate = subDays(today, 365);
        break;
      default:
        startDate = subDays(today, 7);
    }
    
    return sleepEntries.filter(entry => {
      const entryDate = entry.sleepDate.toDate();
      return entryDate >= startDate;
    });
  }, [sleepEntries, selectedTimeframe]);
  
  // Calculate sleep metrics
  const sleepMetrics = useMemo(() => {
    if (filteredSleepData.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        bestQualityDay: null,
        worstQualityDay: null,
        mostCommonMood: null,
        sleepDebtMinutes: 0,
        consistencyScore: 0,
        commonActivities: []
      };
    }
    
    // Calculate average duration
    const totalMinutes = filteredSleepData.reduce(
      (sum, entry) => sum + entry.sleepDuration.totalMinutes,
      0
    );
    const averageDuration = totalMinutes / filteredSleepData.length;
    
    // Average quality
    const totalQuality = filteredSleepData.reduce(
      (sum, entry) => sum + entry.sleepQuality,
      0
    );
    const averageQuality = totalQuality / filteredSleepData.length;
    
    // Best and worst quality days
    const sortedByQuality = [...filteredSleepData].sort(
      (a, b) => b.sleepQuality - a.sleepQuality
    );
    const bestQualityDay = sortedByQuality[0];
    const worstQualityDay = sortedByQuality[sortedByQuality.length - 1];
    
    // Most common mood
    const moodCounts = filteredSleepData.reduce((acc: any, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    
    // Fix the type issues in the mostCommonMood calculation
    const mostCommonMood = Object.entries(moodCounts).reduce<{mood: string | null, count: number}>(
    (max, [mood, count]) => (count as number) > max.count ? { mood, count: count as number } : max,
    { mood: null, count: 0 }
    ).mood;
    
    // Sleep debt (assuming ideal is 8 hours)
    const idealMinutes = filteredSleepData.length * 8 * 60;
    const sleepDebtMinutes = idealMinutes - totalMinutes;
    
    // Consistency score (lower standard deviation = higher consistency)
    const durationValues = filteredSleepData.map(entry => entry.sleepDuration.totalMinutes);
    const mean = averageDuration;
    const squaredDiffs = durationValues.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / durationValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to a 0-100 score (lower stdDev = higher score)
    // Assuming max stdDev would be around 180 minutes (3 hours)
    const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / 1.8)));
    
    // Most common activities
    const activityCounts: Record<string, number> = {};
    filteredSleepData.forEach(entry => {
      (entry.activities || []).forEach((activity: string) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    
    const commonActivities = Object.entries(activityCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 3)
      .map(([activity]) => activity);
    
    return {
      averageDuration,
      averageQuality,
      bestQualityDay,
      worstQualityDay,
      mostCommonMood,
      sleepDebtMinutes,
      consistencyScore,
      commonActivities
    };
  }, [filteredSleepData]);
  
  // Format hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Get insights based on sleep data
  const getSleepInsights = useMemo(() => {
    if (filteredSleepData.length === 0) {
      return "Start logging your sleep to get personalized insights.";
    }
    
    const insights = [];
    
    // Duration insight
    if (sleepMetrics.averageDuration < 420) { // Less than 7 hours
      insights.push("You're averaging less than 7 hours of sleep, which may not be sufficient for optimal health and functioning. Consider going to bed earlier or adjusting your schedule to allow for more rest.");
    } else if (sleepMetrics.averageDuration > 540) { // More than 9 hours
      insights.push("You're sleeping more than 9 hours on average. While some people naturally need more sleep, excessive sleep can sometimes be linked to health conditions or poor sleep quality. If you're still feeling tired despite long sleep, consider consulting a healthcare professional.");
    } else {
      insights.push("Your average sleep duration falls within the recommended 7-9 hours for adults. Great job maintaining a healthy sleep duration!");
    }
    
    // Quality insight
    if (sleepMetrics.averageQuality < 3) {
      insights.push("Your sleep quality seems to be below average. Try implementing good sleep hygiene practices like maintaining a consistent schedule and creating a comfortable sleep environment.");
    } else if (sleepMetrics.averageQuality >= 4) {
      insights.push("You're reporting excellent sleep quality! Continue your current sleep habits to maintain this positive pattern.");
    }
    
    // Consistency insight
    if (sleepMetrics.consistencyScore < 60) {
      insights.push("Your sleep schedule shows significant variation. Maintaining consistent sleep and wake times, even on weekends, can improve your sleep quality and overall well-being.");
    } else if (sleepMetrics.consistencyScore > 80) {
      insights.push("You have a very consistent sleep schedule, which is excellent for your circadian rhythm and sleep quality.");
    }
    
    // Activity insights
    if (sleepMetrics.commonActivities.includes("screen")) {
      insights.push("Screen time before bed appears frequently in your records. The blue light from screens can interfere with melatonin production. Consider using night mode on devices or avoiding screens 1-2 hours before bedtime.");
    }
    
    if (sleepMetrics.commonActivities.includes("caffeine") || sleepMetrics.commonActivities.includes("alcohol")) {
      insights.push("Caffeine and/or alcohol consumption may be affecting your sleep. These substances can disrupt sleep architecture and quality, even if they don't prevent you from falling asleep.");
    }
    
    if (sleepMetrics.commonActivities.includes("meditation") || sleepMetrics.commonActivities.includes("reading")) {
      insights.push("Your bedtime routine includes relaxing activities like reading or meditation, which are excellent practices for promoting quality sleep.");
    }
    
    return insights.join(" ");
  }, [filteredSleepData, sleepMetrics]);

  // Get sleep tips based on average quality
  const getSleepTips = useMemo(() => {
    if (filteredSleepData.length === 0) {
      return sleepTips.moderate;
    }
    
    if (sleepMetrics.averageQuality < 2.5) {
      return sleepTips.poor;
    } else if (sleepMetrics.averageQuality < 4) {
      return sleepTips.moderate;
    } else {
      return sleepTips.good;
    }
  }, [filteredSleepData, sleepMetrics]);

  // Graph data for visualization
  const graphData = useMemo(() => {
    if (filteredSleepData.length === 0) return [];
    
    return filteredSleepData
      .sort((a, b) => a.sleepDate.toDate().getTime() - b.sleepDate.toDate().getTime())
      .slice(-14) // Last 14 entries for better visualization
      .map(entry => ({
        date: format(entry.sleepDate.toDate(), 'MMM dd'),
        hours: entry.sleepDuration.totalMinutes / 60,
        quality: entry.sleepQuality
      }));
  }, [filteredSleepData]);
  
  // If loading auth state, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
      </div>
    );
  }
  
  // If not logged in, redirect will happen via useEffect
  if (!user) {
    return null;
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] pt-24 pb-16 px-4 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 opacity-20 bg-gradient-radial from-blue-900/20 to-transparent"></div>
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-gradient-radial from-indigo-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-gradient-radial from-purple-900/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Sleep Analytics
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
              Track, visualize, and optimize your sleep patterns for better health and well-being.
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Sleep Summary */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-white">Sleep Summary</h2>
                  
                  <div className="relative">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer appearance-none pr-8"
                    >
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                      <option value="3months">Last 3 months</option>
                      <option value="year">Last year</option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none">
                      <HiOutlineChevronDown size={16} />
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                ) : sleepEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <GiNightSleep className="w-12 h-12 text-indigo-500/60 mb-3" />
                    <p className="text-gray-400">No sleep data recorded yet</p>
                    <button 
                      onClick={() => {
                        resetForm();
                        setShowEntryForm(true);
                      }}
                      className="mt-4 bg-white/10 hover:bg-white/15 text-white rounded-lg px-4 py-2 text-sm transition-all flex items-center"
                    >
                      <FiPlusCircle className="mr-2" />
                      Add Your First Entry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Avg. Duration</p>
                        <div className="flex items-center">
                          <FiClock className="text-indigo-400 mr-2" />
                          <span className="text-white text-lg font-medium">
                            {formatDuration(sleepMetrics.averageDuration)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Consistency</p>
                        <div className="flex items-center">
                          <FiTrendingUp className="text-emerald-400 mr-2" />
                          <span className="text-white text-lg font-medium">
                            {Math.round(sleepMetrics.consistencyScore)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Avg. Sleep Quality</p>
                      <div className="flex items-center mt-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                            style={{width: `${(sleepMetrics.averageQuality / 5) * 100}%`}}
                          ></div>
                        </div>
                        <span className="ml-3 text-white font-medium">
                          {sleepMetrics.averageQuality.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    {sleepMetrics.sleepDebtMinutes > 0 && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Sleep Debt</p>
                        <div className="flex items-center">
                          <TbZzz className="text-amber-400 mr-2" />
                          <span className="text-white text-lg font-medium">
                            {formatDuration(sleepMetrics.sleepDebtMinutes)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Based on recommended 8 hours per night
                        </p>
                      </div>
                    )}
                    
                    {sleepMetrics.mostCommonMood && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Most Common Wake Mood</p>
                        <div className="flex items-center">
                          {moodOptions.find(m => m.value === sleepMetrics.mostCommonMood)?.icon}
                          <span className="text-white text-lg ml-2 capitalize">
                            {sleepMetrics.mostCommonMood}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Log Entry Button */}
              <button 
                onClick={() => {
                  resetForm();
                  setShowEntryForm(true);
                }}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl transition-all mb-6"
              >
                <FiPlusCircle size={18} />
                Log New Sleep Entry
              </button>
              
              {/* Recent Entries */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Entries</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                ) : sleepEntries.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No entries yet</p>
                ) : (
                  <div className="space-y-3">
                    {sleepEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="relative">
                        <button 
                          onClick={() => setShowDetailsFor(showDetailsFor === entry.id ? null : entry.id)}
                          className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 text-left transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                entry.sleepQuality >= 4 ? "bg-emerald-500/20" : 
                                entry.sleepQuality >= 3 ? "bg-blue-500/20" : 
                                "bg-amber-500/20"
                              }`}>
                                <GiNightSleep className={`${
                                  entry.sleepQuality >= 4 ? "text-emerald-500" : 
                                  entry.sleepQuality >= 3 ? "text-blue-500" : 
                                  "text-amber-500"
                                }`} />
                              </div>
                              <div className="ml-3">
                                <p className="text-white text-sm">
                                  {format(entry.sleepDate.toDate(), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {formatDuration(entry.sleepDuration.totalMinutes)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, index) => (
                                  <div 
                                    key={index} 
                                    className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                                      index < entry.sleepQuality 
                                        ? "bg-indigo-500" 
                                        : "bg-gray-700"
                                    }`}
                                  ></div>
                                ))}
                              </div>
                              {showDetailsFor === entry.id ? (
                                <HiOutlineChevronUp className="ml-2 text-gray-400" />
                              ) : (
                                <HiOutlineChevronDown className="ml-2 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {/* Entry Detail Dropdown */}
                        <AnimatePresence>
                          {showDetailsFor === entry.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-black/40 rounded-lg mt-1 p-4 border border-white/10">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Bed Time</p>
                                    <p className="text-white">{entry.bedTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Wake Time</p>
                                    <p className="text-white">{entry.wakeTime}</p>
                                  </div>
                                </div>
                                
                                {entry.mood && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500">Wake-up Mood</p>
                                    <p className="text-white capitalize">{entry.mood}</p>
                                  </div>
                                )}
                                
                                {entry.activities && entry.activities.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500">Activities</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {entry.activities.map((activity: string) => (
                                        <span 
                                          key={activity}
                                          className="text-xs bg-white/10 text-white px-2 py-1 rounded"
                                        >
                                          {activity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {entry.notes && (
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-gray-300 text-sm">{entry.notes}</p>
                                  </div>
                                )}
                                
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => handleEditEntry(entry)}
                                    className="text-xs text-white bg-white/10 hover:bg-white/20 py-1 px-3 rounded transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 py-1 px-3 rounded transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle Column - Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sleep Graph */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Sleep Duration Trends</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                ) : graphData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-400">No data available for visualization</p>
                    <p className="text-sm text-gray-500 mt-2">Add sleep entries to see your trends</p>
                  </div>
                ) : (
                  <div className="h-64 relative">
                    {/* Recommended range */}
                    <div className="absolute inset-y-0 left-12 right-0 bg-green-500/5 rounded" style={{ top: '20%', bottom: '40%' }}></div>
                    <div className="absolute right-0 text-xs text-green-500" style={{ top: '18%' }}>9hr</div>
                    <div className="absolute right-0 text-xs text-green-500" style={{ bottom: '38%' }}>7hr</div>
                    
                    {/* Graph */}
                    <div className="flex h-full items-end relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between">
                        <span className="text-xs text-gray-500">12h</span>
                        <span className="text-xs text-gray-500">9h</span>
                        <span className="text-xs text-gray-500">6h</span>
                        <span className="text-xs text-gray-500">3h</span>
                        <span className="text-xs text-gray-500">0h</span>
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between pl-12 h-full">
                        {graphData.map((item, index) => {
                          // Calculate height percentage based on hours (max 12 hours = 100%)
                          const heightPercent = Math.min(100, (item.hours / 12) * 100);
                          const barColor = 
                            item.hours >= 7 && item.hours <= 9
                              ? "bg-gradient-to-t from-blue-600 to-indigo-500"
                              : item.hours < 7
                              ? "bg-gradient-to-t from-amber-500 to-orange-400"
                              : "bg-gradient-to-t from-purple-600 to-indigo-500";
                          
                          return (
                            <div key={index} className="flex flex-col items-center w-full max-w-[40px]">
                              <div className="w-full h-[calc(100%-24px)] flex items-end justify-center">
                                <div 
                                  className={`w-5 rounded-t-md ${barColor}`}
                                  style={{ height: `${heightPercent}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 text-xs text-gray-500 rotate-45 origin-left translate-y-3 whitespace-nowrap">
                                {item.date}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                      <BsStars className="text-indigo-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Sleep Insights</h2>
                  </div>
                  
                  <p className="text-gray-300 text-sm">
                    {getSleepInsights}
                  </p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <RiMoonClearLine className="text-blue-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Sleep Tips</h2>
                  </div>
                  
                  <ul className="space-y-2">
                    {getSleepTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="min-w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-400 text-xs">{index + 1}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Sleep Quality Distribution */}
              {filteredSleepData.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Sleep Quality Distribution</h2>
                  
                  <div className="flex justify-between items-center">
                    {qualityOptions.map((option, index) => {
                      const count = filteredSleepData.filter(
                        entry => entry.sleepQuality === option.value
                      ).length;
                      
                      const percentage = filteredSleepData.length > 0
                        ? Math.round((count / filteredSleepData.length) * 100)
                        : 0;
                      
                      return (
                        <div key={index} className="flex flex-col items-center w-1/5">
                          <div className="h-36 w-full flex flex-col justify-end items-center">
                            <div 
                              className="w-8 rounded-t-md bg-gradient-to-t from-blue-800 to-indigo-500"
                              style={{ height: `${percentage * 2}%`, minHeight: count ? '8px' : '0' }}
                            ></div>
                          </div>
                          <div className="text-center mt-4">
                            <p className="text-white font-medium">{count}</p>
                            <p className="text-gray-500 text-xs">{option.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sleep Entry Modal */}
      <AnimatePresence>
        {showEntryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEntryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-black/80 rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {isEditMode ? "Edit Sleep Entry" : "Log Sleep Entry"}
                </h2>
                <button 
                  onClick={() => setShowEntryForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Date */}
                  <div>
                    <label htmlFor="sleepDate" className="block text-sm font-medium text-gray-300 mb-1">
                      Sleep Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        id="sleepDate"
                        value={sleepDate}
                        onChange={(e) => setSleepDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedTime" className="block text-sm font-medium text-gray-300 mb-1">
                        Bed Time
                      </label>
                      <div className="relative">
                        <FiMoon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          id="bedTime"
                          value={bedTime}
                          onChange={(e) => setBedTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-300 mb-1">
                        Wake Time
                      </label>
                      <div className="relative">
                        <FiSun className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          id="wakeTime"
                          value={wakeTime}
                          onChange={(e) => setWakeTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sleep Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Sleep Quality
                    </label>
                    <div className="flex justify-between items-center">
                      {qualityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSleepQuality(option.value)}
                          className={`flex-1 py-2 text-center text-sm rounded-lg border transition-all ${
                            sleepQuality === option.value
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Wake Mood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Wake-up Mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedMood(option.value)}
                          className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-all ${
                            selectedMood === option.value
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Activities Before Sleep
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleActivity(option.value)}
                          className={`flex items-center px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                            selectedActivities.includes(option.value)
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center ${
                            selectedActivities.includes(option.value)
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/20"
                          }`}>
                            {selectedActivities.includes(option.value) && (
                              <div className="w-2 h-2 bg-indigo-500 rounded-sm"></div>
                            )}
                          </div>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes about your sleep..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEntryForm(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center transition-colors ${
                      isSubmitting ? "opacity-70 cursor-wait" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      isEditMode ? "Update Entry" : "Save Entry"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}