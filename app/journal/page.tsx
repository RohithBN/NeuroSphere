"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
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
import { 
  FiEdit3, FiTrash2, FiCalendar, 
  FiPlusCircle, FiX
} from "react-icons/fi";
import { BsPinAngle } from "react-icons/bs";
import { TbWriting } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi";

// Journal entry prompts
const journalPrompts = [
  "What brought you joy today?",
  "What's been challenging you lately?",
  "What are you grateful for right now?",
  "Describe a moment that made you smile today",
  "What would you like to improve about yourself?",
  "What's a goal you're working towards?",
  "Write about a recent accomplishment",
  "What's something you're looking forward to?",
];

// Tags for categorizing entries
const entryTags = [
  { id: "reflection", label: "Reflection", color: "bg-blue-500" },
  { id: "gratitude", label: "Gratitude", color: "bg-green-500" },
  { id: "goals", label: "Goals", color: "bg-purple-500" },
  { id: "memories", label: "Memories", color: "bg-yellow-500" },
  { id: "challenges", label: "Challenges", color: "bg-red-500" },
  { id: "ideas", label: "Ideas", color: "bg-indigo-500" },
  { id: "dreams", label: "Dreams", color: "bg-pink-500" },
  { id: "lessons", label: "Lessons", color: "bg-teal-500" },
];

export default function Journal() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // States for journal functionality
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [pinnedEntries, setPinnedEntries] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Fetch journal entries
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  // Random prompt generator
  const generateRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setCurrentPrompt(journalPrompts[randomIndex]);
  };

  // Fetch entries from Firestore
  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const entriesRef = collection(db, "journalEntries");
      const q = query(
        entriesRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedEntries: any[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedEntries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  // Handle entry submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    try {
      const entryData = {
        userId: user?.uid,
        title,
        content,
        tags: selectedTags,
        timestamp: Timestamp.now(),
        lastModified: Timestamp.now()
      };
      
      if (isEditMode && editingEntryId) {
        const docRef = doc(db, "journalEntries", editingEntryId);
        await updateDoc(docRef, entryData);
      } else {
        await addDoc(collection(db, "journalEntries"), entryData);
      }
      
      resetForm();
      await fetchEntries();
      setShowEntryForm(false);
    } catch (error) {
      console.error("Error saving entry:", error);
      setError("Failed to save journal entry");
    }
  };

  // Delete entry
  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await deleteDoc(doc(db, "journalEntries", entryId));
      await fetchEntries();
      setExpandedEntry(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setError("Failed to delete entry");
    }
  };

  // Edit entry
  const handleEdit = (entry: any) => {
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTags(entry.tags || []);
    setEditingEntryId(entry.id);
    setIsEditMode(true);
    setShowEntryForm(true);
    setExpandedEntry(null);
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setCurrentPrompt("");
    setIsEditMode(false);
    setEditingEntryId(null);
    setError("");
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Toggle pin status
  const togglePin = (entryId: string) => {
    setPinnedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  // Filter entries by tag
  const filteredEntries = filter
    ? entries.filter(entry => entry.tags?.includes(filter))
    : entries;

  // Sort entries with pinned ones first
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aIsPinned = pinnedEntries.includes(a.id);
    const bIsPinned = pinnedEntries.includes(b.id);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

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
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-gradient-radial from-blue-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-gradient-radial from-indigo-800/20 to-transparent rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Journal Center
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
              Express yourself freely, reflect deeply, and track your emotional journey
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Filters */}
            <div className="lg:col-span-1">
              {/* Stats Card */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Journal Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm">Total Entries</div>
                    <div className="text-2xl font-bold text-white mt-1">{entries.length}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm">This Month</div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {entries.filter(entry => {
                        const entryDate = entry.timestamp.toDate();
                        const now = new Date();
                        return entryDate.getMonth() === now.getMonth();
                      }).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Filter by Tag</h2>
                <div className="space-y-2">
                  {entryTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setFilter(filter === tag.id ? null : tag.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        filter === tag.id
                          ? `${tag.color} bg-opacity-20 border border-white/20`
                          : 'hover:bg-white/5 border border-white/5'
                      }`}
                    >
                      <span className="text-white text-sm">{tag.label}</span>
                      <div className={`w-2 h-2 rounded-full ${tag.color}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle & Right Columns - Entries List & Creation */}
            <div className="lg:col-span-2 space-y-6">
              {/* New Entry Button */}
              <button 
                onClick={() => {
                  resetForm();
                  setShowEntryForm(true);
                }}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
              >
                <FiPlusCircle size={18} />
                Write New Entry
              </button>

              {/* Entries List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                    </div>
                  </div>
                ) : sortedEntries.length === 0 ? (
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
                    <TbWriting className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Start your journaling journey by creating your first entry</p>
                  </div>
                ) : (
                  sortedEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePin(entry.id)}
                              className={`text-gray-400 hover:text-white transition-colors ${
                                pinnedEntries.includes(entry.id) ? "text-white" : ""
                              }`}
                            >
                              <BsPinAngle />
                            </button>
                            <h3 className="text-white font-medium">{entry.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FiCalendar className="w-4 h-4" />
                            {format(entry.timestamp.toDate(), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Preview or full content */}
                          <p className={`text-gray-300 ${
                            expandedEntry === entry.id ? '' : 'line-clamp-2'
                          }`}>
                            {entry.content}
                          </p>

                          {/* Tags */}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {entry.tags.map((tagId: string) => {
                                const tag = entryTags.find(t => t.id === tagId);
                                return tag ? (
                                  <span 
                                    key={tagId}
                                    className={`${tag.color} bg-opacity-20 text-white text-xs px-2 py-1 rounded`}
                                  >
                                    {tag.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => setExpandedEntry(
                              expandedEntry === entry.id ? null : entry.id
                            )}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                          >
                            {expandedEntry === entry.id ? "Show less" : "Read more"}
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Form Modal */}
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-black/80 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {isEditMode ? "Edit Entry" : "New Journal Entry"}
                </h2>
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Writing Prompts */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Need inspiration?
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPrompt}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors flex items-center gap-1"
                    >
                      <HiOutlineSparkles />
                      Generate Prompt
                    </button>
                  </div>
                  {currentPrompt && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3 text-indigo-300 text-sm mb-4">
                      {currentPrompt}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Express your thoughts..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {entryTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedTags.includes(tag.id)
                            ? `${tag.color} bg-opacity-20 border-white/20 text-white`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        } border`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEntryForm(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors"
                  >
                    {isEditMode ? "Update Entry" : "Save Entry"}
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