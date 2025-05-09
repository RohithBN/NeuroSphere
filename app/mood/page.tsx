"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfMonth, eachDayOfInterval } from "date-fns";
import { 
  FiCalendar, FiPlusCircle, FiX, FiEdit2, FiTrash2, 
  FiClock, FiActivity 
} from "react-icons/fi";
import { 
  BiHappy, BiMeh, BiSad, BiAngry, 
   BiLaugh
} from "react-icons/bi";
import { BsLightningChargeFill, BsArrowUp, BsArrowDown } from "react-icons/bs";
import { HiOutlineSparkles, HiOutlineChevronDown } from "react-icons/hi";
import { TbMoodHappy } from "react-icons/tb";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";

// Mood options data
const moodOptions = [
  { value: 5, label: "Excellent", emoji: "😄", icon: <BiLaugh className="w-5 h-5" />, color: "bg-green-500" },
  { value: 4, label: "Good", emoji: "🙂", icon: <BiHappy className="w-5 h-5" />, color: "bg-teal-500" },
  { value: 3, label: "Okay", emoji: "😐", icon: <BiMeh className="w-5 h-5" />, color: "bg-blue-500" },
  { value: 2, label: "Low", emoji: "😔", icon: <BiSad className="w-5 h-5" />, color: "bg-purple-500" },
  { value: 1, label: "Bad", emoji: "😣", icon: <BiAngry className="w-5 h-5" />, color: "bg-red-500" },
];

// Activity tags
const activityTags = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "exercise", label: "Exercise", icon: "🏃‍♂️" },
  { id: "family", label: "Family", icon: "👪" },
  { id: "friends", label: "Friends", icon: "👫" },
  { id: "hobbies", label: "Hobbies", icon: "🎨" },
  { id: "studying", label: "Studying", icon: "📚" },
  { id: "socializing", label: "Socializing", icon: "🎉" },
  { id: "selfCare", label: "Self-care", icon: "🧘‍♀️" },
  { id: "dating", label: "Dating", icon: "❤️" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "resting", label: "Resting", icon: "😴" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "reading", label: "Reading", icon: "📖" },
];

export default function MoodTracker() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // States for logging new mood entry
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState(
    format(new Date(), "HH:mm")
  );
  const [selectedMood, setSelectedMood] = useState(3);
  const [moodNote, setMoodNote] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // States for mood data and visualization
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [showDetailsFor, setShowDetailsFor] = useState<string | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);
  
  // Fetch mood data on load
  useEffect(() => {
    if (user) {
      fetchMoodData();
    }
  }, [user]);
  
  // Fetch mood data from Firestore
  const fetchMoodData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const moodRef = collection(db, "moodData");
      const q = query(
        moodRef, 
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const entries: any[] = [];
      
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setMoodEntries(entries);
    } catch (error) {
      console.error("Error fetching mood data:", error);
      setError("Failed to load mood data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Submit mood entry form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      setIsSubmitting(true);
      
      // Create timestamp from date and time
      const dateTimeStr = `${selectedDate}T${selectedTime}:00`;
      const entryDateTime = new Date(dateTimeStr);
      
      const moodEntry = {
        userId: user?.uid,
        mood: selectedMood,
        moodLabel: moodOptions.find(m => m.value === selectedMood)?.label || "Neutral",
        energyLevel,
        note: moodNote,
        activities: selectedActivities,
        date: selectedDate,
        time: selectedTime,
        timestamp: Timestamp.fromDate(entryDateTime),
        createdAt: Timestamp.now()
      };
      
      if (isEditMode && editingEntryId) {
        // Update existing entry
        const docRef = doc(db, "moodData", editingEntryId);
        await updateDoc(docRef, moodEntry);
      } else {
        // Create new entry
        await addDoc(collection(db, "moodData"), moodEntry);
      }
      
      // Reset form and refresh data
      resetForm();
      await fetchMoodData();
      setShowEntryForm(false);
      
    } catch (error) {
      console.error("Error saving mood entry:", error);
      setError("Failed to save mood entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a mood entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this mood record?")) return;
    
    try {
      await deleteDoc(doc(db, "moodData", entryId));
      await fetchMoodData();
      setShowDetailsFor(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setError("Failed to delete entry. Please try again.");
    }
  };
  
  // Edit an existing entry
  const handleEditEntry = (entry: any) => {
    setSelectedDate(entry.date);
    setSelectedTime(entry.time);
    setSelectedMood(entry.mood);
    setMoodNote(entry.note || "");
    setSelectedActivities(entry.activities || []);
    setEnergyLevel(entry.energyLevel);
    setEditingEntryId(entry.id);
    setIsEditMode(true);
    setShowEntryForm(true);
    setShowDetailsFor(null);
  };
  
  // Reset form fields
  const resetForm = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime(format(new Date(), "HH:mm"));
    setSelectedMood(3);
    setMoodNote("");
    setSelectedActivities([]);
    setEnergyLevel(3);
    setIsEditMode(false);
    setEditingEntryId(null);
    setError("");
  };
  
  // Toggle activity selection
  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  // Filter data based on selected timeframe
  const filteredMoodData = useMemo(() => {
    if (moodEntries.length === 0) return [];
    
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
    
    return moodEntries.filter(entry => {
      const entryDate = entry.timestamp.toDate();
      return entryDate >= startDate;
    });
  }, [moodEntries, selectedTimeframe]);
  
  // Calculate mood metrics
  const moodMetrics = useMemo(() => {
    if (filteredMoodData.length === 0) {
      return {
        averageMood: 0,
        moodVariability: 0,
        mostFrequentMood: null,
        mostFrequentActivities: [],
        moodTrend: "neutral",
        energyTrend: "neutral",
        correlations: []
      };
    }
    
    // Calculate average mood
    const totalMoodValue = filteredMoodData.reduce(
      (sum, entry) => sum + entry.mood,
      0
    );
    const averageMood = totalMoodValue / filteredMoodData.length;
    
    // Calculate mood variability (standard deviation)
    const moodValues = filteredMoodData.map(entry => entry.mood);
    const mean = averageMood;
    const squaredDiffs = moodValues.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / moodValues.length;
    const moodVariability = Math.sqrt(variance);
    
    // Most frequent mood
    const moodCounts: Record<number, number> = {};
    filteredMoodData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostFrequentMood = Object.entries(moodCounts)
      .reduce<{value: number | null, count: number}>(
        (max, [mood, count]) => (count as number) > max.count 
          ? { value: Number(mood), count: count as number } 
          : max,
        { value: null, count: 0 }
      ).value;
    
    // Most frequent activities
    const activityCounts: Record<string, number> = {};
    filteredMoodData.forEach(entry => {
      (entry.activities || []).forEach((activity: string) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    
    const mostFrequentActivities = Object.entries(activityCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 5)
      .map(([activity]) => activity);
    
    // Detect mood trend (improving, declining, stable)
    let moodTrend = "neutral";
    if (filteredMoodData.length >= 3) {
      const recentEntries = [...filteredMoodData]
        .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime())
        .slice(-5);
        
      const firstMoods = recentEntries.slice(0, Math.ceil(recentEntries.length / 2))
        .reduce((sum, entry) => sum + entry.mood, 0) / Math.ceil(recentEntries.length / 2);
        
      const lastMoods = recentEntries.slice(Math.floor(recentEntries.length / 2))
        .reduce((sum, entry) => sum + entry.mood, 0) / Math.ceil(recentEntries.length / 2);
      
      if (lastMoods - firstMoods > 0.5) {
        moodTrend = "improving";
      } else if (firstMoods - lastMoods > 0.5) {
        moodTrend = "declining";
      }
    }
    
    // Energy level trend
    let energyTrend = "neutral";
    if (filteredMoodData.length >= 3) {
      const recentEntries = [...filteredMoodData]
        .filter(entry => entry.energyLevel !== undefined) // Ensure entry has energy level
        .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime())
        .slice(-5);
        
      if (recentEntries.length >= 3) {
        const firstEnergies = recentEntries.slice(0, Math.ceil(recentEntries.length / 2))
          .reduce((sum, entry) => sum + entry.energyLevel, 0) / Math.ceil(recentEntries.length / 2);
          
        const lastEnergies = recentEntries.slice(Math.floor(recentEntries.length / 2))
          .reduce((sum, entry) => sum + entry.energyLevel, 0) / Math.ceil(recentEntries.length / 2);
        
        if (lastEnergies - firstEnergies > 0.5) {
          energyTrend = "increasing";
        } else if (firstEnergies - lastEnergies > 0.5) {
          energyTrend = "decreasing";
        }
      }
    }
    
    // Find correlations between activities and mood
    const correlations: {activity: string, impact: number, count: number}[] = [];
    
    mostFrequentActivities.forEach(activity => {
      const entriesWithActivity = filteredMoodData.filter(entry => 
        entry.activities && entry.activities.includes(activity)
      );
      
      const entriesWithoutActivity = filteredMoodData.filter(entry => 
        !entry.activities || !entry.activities.includes(activity)
      );
      
      if (entriesWithActivity.length >= 2 && entriesWithoutActivity.length >= 2) {
        const avgMoodWith = entriesWithActivity.reduce((sum, entry) => sum + entry.mood, 0) / entriesWithActivity.length;
        const avgMoodWithout = entriesWithoutActivity.reduce((sum, entry) => sum + entry.mood, 0) / entriesWithoutActivity.length;
        
        correlations.push({
          activity,
          impact: avgMoodWith - avgMoodWithout,
          count: entriesWithActivity.length
        });
      }
    });
    
    return {
      averageMood,
      moodVariability,
      mostFrequentMood,
      mostFrequentActivities,
      moodTrend,
      energyTrend,
      correlations: correlations.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 3)
    };
  }, [filteredMoodData]);
  
  // Generate insights based on mood data
  const moodInsights = useMemo(() => {
    if (filteredMoodData.length === 0) {
      return ["Start logging your moods to receive personalized insights."];
    }
    
    const insights = [];
    
    // Average mood insight
    const averageMoodText = moodOptions.find(m => 
      m.value === Math.round(moodMetrics.averageMood)
    )?.label || "Neutral";
    
    insights.push(`Your average mood has been ${averageMoodText.toLowerCase()} during this period. ${
      moodMetrics.averageMood > 3.5 
        ? "That's great! Keep engaging in activities that boost your wellbeing." 
        : moodMetrics.averageMood < 2.5 
          ? "Consider focusing more on self-care and activities that spark joy."
          : "Your emotional state is balanced, but there's room for improvement."
    }`);
    
    // Mood trend insight
    if (filteredMoodData.length >= 3) {
      if (moodMetrics.moodTrend === "improving") {
        insights.push("Your mood has been improving recently. Whatever you're doing seems to be working well for your mental health.");
      } else if (moodMetrics.moodTrend === "declining") {
        insights.push("Your mood has been declining recently. This might be a good time to reflect on stressors in your life and consider additional self-care.");
      } else {
        insights.push("Your mood has been relatively stable recently. Consistency can be positive, especially if you're feeling good overall.");
      }
    }
    
    // Activity correlations
    const positiveCorrelations = moodMetrics.correlations.filter(c => c.impact > 0.5);
    const negativeCorrelations = moodMetrics.correlations.filter(c => c.impact < -0.5);
    
    if (positiveCorrelations.length > 0) {
      const activities = positiveCorrelations.map(c => {
        const activity = activityTags.find(tag => tag.id === c.activity);
        return activity ? `${activity.icon} ${activity.label}` : c.activity;
      }).join(", ");
      
      insights.push(`Activities associated with improved mood: ${activities}. Consider prioritizing these in your routine.`);
    }
    
    if (negativeCorrelations.length > 0) {
      const activities = negativeCorrelations.map(c => {
        const activity = activityTags.find(tag => tag.id === c.activity);
        return activity ? `${activity.icon} ${activity.label}` : c.activity;
      }).join(", ");
      
      insights.push(`Activities associated with lower mood: ${activities}. Consider how to manage or balance these activities.`);
    }
    
    // Variability insight
    if (moodMetrics.moodVariability > 1.2) {
      insights.push("Your mood shows significant variability. While some fluctuation is normal, extreme swings might indicate a need for mood stabilizing activities like meditation or consistent sleep patterns.");
    } else if (moodMetrics.moodVariability < 0.5 && filteredMoodData.length > 5) {
      insights.push("Your mood is very consistent. This stability can be beneficial, though remember it's also normal to experience a range of emotions.");
    }
    
    // Energy level insight
    if (moodMetrics.energyTrend === "increasing") {
      insights.push("Your energy levels appear to be improving. This often correlates with better sleep, nutrition, or physical activity.");
    } else if (moodMetrics.energyTrend === "decreasing") {
      insights.push("Your energy levels seem to be decreasing. Consider evaluating your sleep quality, stress levels, and physical activity.");
    }
    
    // Fill with generic insights if needed
    if (insights.length < 3) {
      insights.push("Regular mood tracking helps identify patterns that affect your emotional wellbeing, allowing for more informed self-care decisions.");
    }
    
    if (insights.length < 4 && filteredMoodData.length < 10) {
      insights.push("Continue logging your moods to receive more personalized insights. More data leads to more accurate patterns and correlations.");
    }
    
    return insights;
  }, [filteredMoodData, moodMetrics]);
  
  // Graph data for mood visualization
  const graphData = useMemo(() => {
    if (filteredMoodData.length === 0) return [];
    
    return [...filteredMoodData]
      .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime())
      .slice(-14) // Last 14 entries for better visualization
      .map(entry => ({
        date: format(entry.timestamp.toDate(), 'MMM dd'),
        shortDate: format(entry.timestamp.toDate(), 'dd'),
        mood: entry.mood,
        energy: entry.energyLevel,
        label: moodOptions.find(m => m.value === entry.mood)?.label,
        color: moodOptions.find(m => m.value === entry.mood)?.color,
        time: format(entry.timestamp.toDate(), 'h:mm a')
      }));
  }, [filteredMoodData]);
  
  // Calendar view data
  const calendarData = useMemo(() => {
    if (moodEntries.length === 0) return [];
    
    // Get current month days
    const today = new Date();
    const start = startOfMonth(today);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of month
    
    const days = eachDayOfInterval({ start, end });
    
    // Create calendar data
    return days.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      
      // Find mood entries for this day
      const dayEntries = moodEntries.filter(entry => entry.date === date);
      
      if (dayEntries.length === 0) {
        return { date, day: format(day, 'd'), hasEntry: false };
      }
      
      // If multiple entries in a day, use the average mood
      const totalMood = dayEntries.reduce((sum, entry) => sum + entry.mood, 0);
      const avgMood = Math.round(totalMood / dayEntries.length);
      
      return {
        date,
        day: format(day, 'd'),
        hasEntry: true,
        mood: avgMood,
        color: moodOptions.find(m => m.value === avgMood)?.color
      };
    });
  }, [moodEntries]);
  
  // Mood distribution data
  const moodDistributionData = useMemo(() => {
    if (filteredMoodData.length === 0) return [];
    
    // Count occurrences of each mood
    const moodCounts: Record<number, number> = {};
    
    filteredMoodData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Format for visualization
    return moodOptions.map(option => {
      const count = moodCounts[option.value] || 0;
      const percentage = filteredMoodData.length > 0
        ? Math.round((count / filteredMoodData.length) * 100)
        : 0;
        
      return {
        mood: option.value,
        label: option.label,
        emoji: option.emoji,
        count,
        percentage,
        color: option.color
      };
    });
  }, [filteredMoodData]);
  
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
          <div className="absolute inset-0 opacity-20 bg-gradient-radial from-purple-900/20 to-transparent"></div>
          <div className="absolute top-[30%] left-[10%] w-64 h-64 bg-gradient-radial from-blue-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-gradient-radial from-indigo-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Mood Tracker
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
              Track, understand, and improve your emotional wellbeing by identifying patterns and triggers.
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Mood Summary & Entry */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-white">Mood Summary</h2>
                  
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
                ) : moodEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <TbMoodHappy className="w-12 h-12 text-indigo-500/60 mb-3" />
                    <p className="text-gray-400">No mood data recorded yet</p>
                    <button 
                      onClick={() => {
                        resetForm();
                        setShowEntryForm(true);
                      }}
                      className="mt-4 bg-white/10 hover:bg-white/15 text-white rounded-lg px-4 py-2 text-sm transition-all flex items-center"
                    >
                      <FiPlusCircle className="mr-2" />
                      Log Your First Mood
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Average Mood */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Average Mood</p>
                      <div className="flex items-center">
                        {moodOptions.find(m => m.value === Math.round(moodMetrics.averageMood))?.icon}
                        <span className="text-white text-lg font-medium ml-2">
                          {moodOptions.find(m => m.value === Math.round(moodMetrics.averageMood))?.label || "Neutral"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mood Trend */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Mood Trend</p>
                      <div className="flex items-center">
                        {moodMetrics.moodTrend === "improving" ? (
                          <BsArrowUp className="text-green-400 w-5 h-5" />
                        ) : moodMetrics.moodTrend === "declining" ? (
                          <BsArrowDown className="text-red-400 w-5 h-5" />
                        ) : (
                          <FiActivity className="text-blue-400 w-5 h-5" />
                        )}
                        <span className="text-white text-lg font-medium ml-2 capitalize">
                          {moodMetrics.moodTrend === "neutral" ? "Stable" : moodMetrics.moodTrend}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mood Variability */}
                    {filteredMoodData.length >= 3 && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Emotional Variability</p>
                        <div className="flex items-center mt-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              style={{
                                // Map variability from 0-2 to 0-100%
                                width: `${Math.min(100, (moodMetrics.moodVariability / 2) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="ml-3 text-white font-medium">
                            {moodMetrics.moodVariability.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {moodMetrics.moodVariability > 1.2 
                            ? "High variability" 
                            : moodMetrics.moodVariability > 0.7 
                              ? "Moderate variability"
                              : "Low variability"}
                        </p>
                      </div>
                    )}
                    
                    {/* Top Activities */}
                    {filteredMoodData.length >= 3 && moodMetrics.mostFrequentActivities.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-gray-500 mb-2">Top Activities</p>
                        <div className="flex flex-wrap gap-2">
                          {moodMetrics.mostFrequentActivities.slice(0, 3).map((activityId) => {
                            const activity = activityTags.find(a => a.id === activityId);
                            return (
                              <span 
                                key={activityId} 
                                className="inline-flex items-center bg-white/10 text-white text-xs px-2 py-1 rounded"
                              >
                                {activity ? `${activity.icon} ${activity.label}` : activityId}
                              </span>
                            );
                          })}
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
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all mb-6"
              >
                <FiPlusCircle size={18} />
                Log New Mood Entry
              </button>
              
              {/* Recent Entries */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Entries</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                ) : moodEntries.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No entries yet</p>
                ) : (
                  <div className="space-y-3">
                    {moodEntries.slice(0, 5).map((entry) => {
                      const moodOption = moodOptions.find(m => m.value === entry.mood);
                      
                      return (
                        <div key={entry.id} className="relative">
                          <button 
                            onClick={() => setShowDetailsFor(showDetailsFor === entry.id ? null : entry.id)}
                            className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 text-left transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  moodOption?.color ? moodOption.color.replace('bg-', 'bg-') + '/20' : 'bg-gray-500/20'
                                }`}>
                                  <div className={`${
                                    moodOption?.color ? moodOption.color.replace('bg-', 'text-') : 'text-gray-500'
                                  }`}>
                                    {moodOption?.icon || <BiMeh className="w-5 h-5" />}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-white text-sm">
                                    {format(entry.timestamp.toDate(), 'MMM dd, yyyy')}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {format(entry.timestamp.toDate(), 'h:mm a')} - {moodOption?.label || "Neutral"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {showDetailsFor === entry.id ? (
                                  <HiOutlineChevronDown className="text-gray-400 rotate-180 transition-transform" />
                                ) : (
                                  <HiOutlineChevronDown className="text-gray-400 transition-transform" />
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
                                  <div className="space-y-3">
                                    {entry.energyLevel !== undefined && (
                                      <div>
                                        <p className="text-xs text-gray-500">Energy Level</p>
                                        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                                          <div 
                                            className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                                            style={{width: `${(entry.energyLevel / 5) * 100}%`}}
                                          ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                          <span>Low</span>
                                          <span>High</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {entry.activities && entry.activities.length > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Activities</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {entry.activities.map((activityId: string) => {
                                            const activity = activityTags.find(a => a.id === activityId);
                                            return (
                                              <span 
                                                key={activityId}
                                                className="text-xs bg-white/10 text-white px-2 py-1 rounded"
                                              >
                                                {activity ? `${activity.icon} ${activity.label}` : activityId}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {entry.note && (
                                      <div>
                                        <p className="text-xs text-gray-500">Note</p>
                                        <p className="text-gray-300 text-sm mt-1">{entry.note}</p>
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-end space-x-3 pt-2">
                                      <button
                                        onClick={() => handleEditEntry(entry)}
                                        className="text-xs text-white bg-white/10 hover:bg-white/20 py-1 px-3 rounded transition-colors flex items-center"
                                      >
                                        <FiEdit2 className="mr-1" /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 py-1 px-3 rounded transition-colors flex items-center"
                                      >
                                        <FiTrash2 className="mr-1" /> Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle & Right Columns - Visualizations and Insights */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mood Timeline */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Mood Timeline</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                ) : graphData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-400">No data available for visualization</p>
                    <p className="text-sm text-gray-500 mt-2">Add mood entries to see your patterns</p>
                  </div>
                ) : (
                  <div className="h-64 relative">
                    {/* Graph */}
                    <div className="flex h-full items-end relative">
                      {/* Y axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">😄</span>
                          <span className="text-xs text-gray-500">5</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">🙂</span>
                          <span className="text-xs text-gray-500">4</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">😐</span>
                          <span className="text-xs text-gray-500">3</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">😔</span>
                          <span className="text-xs text-gray-500">2</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">😣</span>
                          <span className="text-xs text-gray-500">1</span>
                        </div>
                      </div>
                      
                      {/* The actual graph */}
                      <div className="flex-1 pl-12 h-full flex flex-col">
                        {/* Grid lines */}
                        <div className="grid grid-cols-1 grid-rows-5 h-full w-full absolute top-0 left-12 right-0">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className="border-b border-white/5"
                              style={{ gridRowStart: i + 1 }}
                            ></div>
                          ))}
                        </div>
                        
                        {/* Mood line chart */}
                        <div className="h-full w-full relative">
                          <svg 
                            width="100%" 
                            height="100%" 
                            className="absolute inset-0" 
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="moodLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(129, 140, 248)" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="rgb(129, 140, 248)" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            
                            {graphData.length > 1 && (
                              <>
                                {/* Area under the curve */}
                                <path
                                  d={`
                                    M ${100 / (graphData.length - 1) * 0}% ${100 - (graphData[0].mood - 1) * 25}%
                                    ${graphData.map((item, index) => 
                                      `L ${100 / (graphData.length - 1) * index}% ${100 - (item.mood - 1) * 25}%`
                                    ).join(' ')}
                                    L ${100 / (graphData.length - 1) * (graphData.length - 1)}% 100%
                                    L ${100 / (graphData.length - 1) * 0}% 100%
                                    Z
                                  `}
                                  fill="url(#moodLineGradient)"
                                />
                                
                                {/* Line connecting points */}
                                <path
                                  d={graphData.map((item, index) => 
                                    `${index === 0 ? 'M' : 'L'} ${100 / (graphData.length - 1) * index}% ${100 - (item.mood - 1) * 25}%`
                                  ).join(' ')}
                                  stroke="rgb(129, 140, 248)"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </>
                            )}
                            
                            {/* Data points */}
                            {graphData.map((item, index) => (
                              <circle
                                key={index}
                                cx={`${100 / (Math.max(1, graphData.length - 1)) * index}%`}
                                cy={`${100 - (item.mood - 1) * 25}%`}
                                r="4"
                                className={`${item.color || 'fill-indigo-500'} stroke-white stroke-1`}
                              />
                            ))}
                          </svg>
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="flex justify-between mt-4">
                          {graphData.map((item, index) => (
                            <div 
                              key={index} 
                              className="text-xs text-gray-500 flex flex-col items-center"
                              style={{ 
                                width: `${100 / graphData.length}%`, 
                                maxWidth: '60px',
                                transform: graphData.length > 7 ? 'rotate(45deg) translateY(8px)' : 'none',
                                transformOrigin: 'center',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.shortDate}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Insights and Monthly View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights */}
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                      <HiOutlineSparkles className="text-purple-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Insights</h2>
                  </div>
                  
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeInsight}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-300 text-sm"
                      >
                        <p>{moodInsights[activeInsight] || "Start tracking your mood to receive insights."}</p>
                      </motion.div>
                    </AnimatePresence>
                    
                    {moodInsights.length > 1 && (
                      <div className="flex justify-center mt-4 space-x-1">
                        {moodInsights.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveInsight(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === activeInsight ? 'bg-purple-500 scale-110' : 'bg-white/30'
                            }`}
                            aria-label={`Insight ${index + 1}`}
                          ></button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Monthly View */}
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Monthly Overview</h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                    </div>
                  ) : calendarData.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No data available</p>
                  ) : (
                    <div className="grid grid-cols-7 gap-2">
                      {/* Day labels */}
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div key={idx} className="text-xs text-gray-500 text-center p-1">
                          {day}
                        </div>
                      ))}
                      
                      {/* Empty cells for proper month alignment */}
                      {(() => {
                        if (calendarData.length === 0) return null;
                        
                        const firstDay = new Date(`${calendarData[0].date}T00:00:00`);
                        const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        
                        return [...Array(dayOfWeek)].map((_, idx) => (
                          <div key={`empty-${idx}`} className="p-1"></div>
                        ));
                      })()}
                      
                      {/* Calendar days */}
                      {calendarData.map((day, idx) => (
                        <div 
                          key={idx}
                          className={`aspect-square rounded-md flex items-center justify-center text-sm ${
                            day.hasEntry 
                              ? `${day.color?.replace('bg-', 'bg-') || 'bg-gray-500'}/30`
                              : 'hover:bg-white/5 transition-colors'
                          } ${
                            day.date === format(new Date(), 'yyyy-MM-dd')
                              ? 'border border-white/20'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className={`${day.hasEntry ? 'text-white' : 'text-gray-500'}`}>
                              {day.day}
                            </span>
                            {day.hasEntry && (
                              <span className="text-xs mt-1">
                                {moodOptions.find(m => m.value === day.mood)?.emoji}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mood Distribution */}
              {moodDistributionData.length > 0 && filteredMoodData.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Mood Distribution</h2>
                  
                  <div className="flex justify-between items-end">
                    {moodDistributionData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-2xl mb-2">{data.emoji}</div>
                        <div 
                          className={`w-full max-w-[50px] rounded-t-md ${data.color} opacity-80`}
                          style={{ height: `${Math.max(5, data.percentage * 2)}px` }}
                        ></div>
                        <p className="text-white text-sm mt-2">{data.count}</p>
                        <p className="text-gray-500 text-xs">{data.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Energy vs Mood Chart */}
              {graphData.length > 3 && graphData.some(item => item.energy !== undefined) && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Energy vs Mood</h2>
                  
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Scatter plot visualization would go here */}
                      <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                        <div className="text-center">
                          <BsLightningChargeFill className="text-yellow-500 w-8 h-8 mx-auto mb-2" />
                          <p className="text-gray-300 text-sm">
                            {moodMetrics.energyTrend === "increasing" 
                              ? "Your energy levels are on an upward trend" 
                              : moodMetrics.energyTrend === "decreasing"
                                ? "Your energy levels are decreasing recently"
                                : "Your energy levels have been relatively stable"}
                          </p>
                          <div className="flex items-center justify-center mt-3 space-x-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                              <span className="text-gray-400 text-xs">Mood</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-gray-400 text-xs">Energy</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Activity Impact */}
              {moodMetrics.correlations.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Activity Impact Analysis</h2>
                  
                  <div className="space-y-4">
                    {moodMetrics.correlations.map((correlation, index) => {
                      const activity = activityTags.find(a => a.id === correlation.activity);
                      const isPositive = correlation.impact > 0;
                      
                      return (
                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{activity?.icon}</span>
                              <span className="text-white">{activity?.label}</span>
                            </div>
                            <span className={`text-sm ${
                              isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {isPositive ? '+' : ''}{(correlation.impact * 100).toFixed(1)}% impact
                            </span>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  isPositive 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                                }`}
                                style={{
                                  width: `${Math.abs(correlation.impact * 100)}%`,
                                  marginLeft: isPositive ? '50%' : undefined,
                                  marginRight: !isPositive ? '50%' : undefined,
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-sm mt-2">
                            Based on {correlation.count} instances
                          </p>
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
      
      {/* Mood Entry Modal */}
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
                  {isEditMode ? "Edit Mood Entry" : "Log Your Mood"}
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Time
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Mood Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    How are you feeling?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedMood(option.value)}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                          selectedMood === option.value
                            ? `${option.color} border-white/20 scale-105`
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl mb-1">{option.emoji}</span>
                        <span className={`text-xs ${
                          selectedMood === option.value ? 'text-white' : 'text-gray-400'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Energy Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Energy Level
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Very Low</span>
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                      <span>Very High</span>
                    </div>
                  </div>
                </div>
                
                {/* Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What have you been doing?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {activityTags.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.id)}
                        className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-all ${
                          selectedActivities.includes(activity.id)
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-2">{activity.icon}</span>
                        {activity.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="Add any thoughts or reflections..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
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
                    className={`px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center transition-colors ${
                      isSubmitting ? 'opacity-70 cursor-wait' : ''
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