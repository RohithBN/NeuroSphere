"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  increment,
  Timestamp 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { 
  FiMessageSquare, FiHeart, FiShare2, FiMoreVertical,
  FiPlusCircle, FiX, FiBookmark 
} from "react-icons/fi";
import { RiCommunityLine } from "react-icons/ri";

interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    timestamp: Timestamp;
    author?: Author;
  }
  
  interface Post {
    id: string;
    userId: string;
    title: string;
    content: string;
    categories: string[];
    likes: number;
    likedBy: string[];
    savedBy: string[];
    timestamp: Timestamp;
    commentCount: number;
    author?: Author;      // Make author optional since it's added after fetching
    comments?: Comment[]; // Make comments optional since they're added after fetching
  }
  
  interface Author {
    name: string;
    email: string;
    uid: string;
  }

// Post categories
const categories = [
  { id: "mental-health", label: "Mental Health", color: "bg-purple-500" },
  { id: "anxiety", label: "Anxiety", color: "bg-blue-500" },
  { id: "depression", label: "Depression", color: "bg-indigo-500" },
  { id: "mindfulness", label: "Mindfulness", color: "bg-green-500" },
  { id: "self-care", label: "Self Care", color: "bg-pink-500" },
  { id: "stress", label: "Stress Management", color: "bg-orange-500" },
  { id: "relationships", label: "Relationships", color: "bg-red-500" },
  { id: "success-stories", label: "Success Stories", color: "bg-teal-500" },
  { id: "questions", label: "Questions", color: "bg-yellow-500" },
  { id: "resources", label: "Resources", color: "bg-cyan-500" }
];

export default function Community() {
  const { user, isLoading, userProfile } = useAuth();
  const router = useRouter();

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Fetch posts
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, selectedCategory, sortBy]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, "communityPosts");
      let q = query(postsRef, orderBy("timestamp", "desc"));
  
      if (selectedCategory) {
        q = query(postsRef, 
          where("categories", "array-contains", selectedCategory),
          orderBy("timestamp", "desc")
        );
      }
  
      if (sortBy === "popular") {
        q = query(postsRef, orderBy("likes", "desc"));
      }
  
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = [];
  
      for (const doc of querySnapshot.docs) {
        const postData = doc.data() as Omit<Post, 'id'>;
        const post = { id: doc.id, ...postData };
        
        // Fetch author details
        const authorSnap = await getDocs(
          query(collection(db, "users"), 
          where("uid", "==", post.userId))
        );
        const authorData = authorSnap.docs[0]?.data() as Author | undefined;
        
        // Fetch comments
        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", doc.id),
          orderBy("timestamp", "desc")
        );
        const commentsSnap = await getDocs(commentsQuery);
const comments: Comment[] = commentsSnap.docs.map(doc => ({
  id: doc.id,
  postId: doc.data().postId,
  userId: doc.data().userId,
  content: doc.data().content,
  timestamp: doc.data().timestamp,
  author: undefined // We'll fetch the author details if needed
}));

// If you need author details for comments, add this after mapping:
for (const comment of comments) {
  const authorSnap = await getDocs(
    query(collection(db, "users"), 
    where("uid", "==", comment.userId))
  );
  const authorData = authorSnap.docs[0]?.data() as Author | undefined;
  comment.author = authorData;
}

fetchedPosts.push({
  ...post,
  author: authorData,
  comments
});
      }
  
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim() || selectedCategories.length === 0) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const postData = {
        userId: user?.uid,
        title,
        content,
        categories: selectedCategories,
        likes: 0,
        likedBy: [],
        savedBy: [],
        timestamp: Timestamp.now(),
        commentCount: 0
      };

      await addDoc(collection(db, "communityPosts"), postData);
      setShowNewPostModal(false);
      resetForm();
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle like on post
  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      const postRef = doc(db, "communityPosts", postId);
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked 
          ? posts.find(p => p.id === postId)?.likedBy.filter((id: string) => id !== user.uid)
          : [...(posts.find(p => p.id === postId)?.likedBy || []), user.uid]
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Add comment
  const handleComment = async (postId: string) => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      const commentData = {
        postId,
        userId: user?.uid,
        content: comment,
        timestamp: Timestamp.now()
      };

      await addDoc(collection(db, "comments"), commentData);
      
      // Update post comment count
      const postRef = doc(db, "communityPosts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setComment("");
      setShowCommentBox(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedCategories([]);
    setError("");
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
              Community Forum
            </h1>
            <p className="text-gray-400 mt-2">
              Share experiences, ask questions, and support each other on your mental wellness journey
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Categories & Filters */}
            <div className="lg:col-span-1 space-y-6">
              {/* Create Post Button */}
              <button
                onClick={() => setShowNewPostModal(true)}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
              >
                <FiPlusCircle size={18} />
                Create New Post
              </button>

              {/* Categories */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? `${category.color} bg-opacity-20 border border-white/20`
                          : 'hover:bg-white/5 border border-white/5'
                      }`}
                    >
                      <span className="text-white text-sm">{category.label}</span>
                      <div className={`w-2 h-2 rounded-full ${category.color}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Sort By</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy("latest")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      sortBy === "latest"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy("popular")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      sortBy === "popular"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    Most Popular
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Posts */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
                  <RiCommunityLine className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No posts found in this category</p>
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white transition-colors"
                  >
                    Create the first post
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <div
                      key={post.id}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-sm">
                              {post.author?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {post.author?.name || "Anonymous"}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {format(post.timestamp.toDate(), 'MMM dd, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <FiMoreVertical />
                        </button>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{post.content}</p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((categoryId: string) => {
                          const category = categories.find(c => c.id === categoryId);
                          return category ? (
                            <span
                              key={categoryId}
                              className={`${category.color} bg-opacity-20 text-white text-xs px-2 py-1 rounded`}
                            >
                              {category.label}
                            </span>
                          ) : null;
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => toggleLike(post.id, post.likedBy?.includes(user.uid))}
                            className={`flex items-center gap-2 transition-colors ${
                              post.likedBy?.includes(user.uid)
                                ? "text-red-400"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          >
                            <FiHeart className={post.likedBy?.includes(user.uid) ? "fill-current" : ""} />
                            <span>{post.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => setShowCommentBox(
                              showCommentBox === post.id ? null : post.id
                            )}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <FiMessageSquare />
                            <span>{post.comments?.length || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <FiShare2 />
                          </button>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <FiBookmark />
                        </button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {showCommentBox === post.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/5"
                          >
                            {/* Comment Input */}
                            <div className="flex gap-4 mb-4">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex-shrink-0 flex items-center justify-center border border-white/20">
                                <span className="text-white font-bold text-xs">
                                  {userProfile?.name?.charAt(0) || "U"}
                                </span>
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Write a comment..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                                />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={isSubmitting || !comment.trim()}
                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    Post Comment
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                              {post.comments?.map((comment: any) => (
                                <div key={comment.id} className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex-shrink-0 flex items-center justify-center border border-white/20">
                                    <span className="text-white font-bold text-xs">
                                      {comment.author?.name?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div className="flex-1 bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-white text-sm font-medium">
                                        {comment.author?.name || "Anonymous"}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        {format(comment.timestamp.toDate(), 'MMM dd, yyyy')}
                                      </p>
                                    </div>
                                    <p className="text-gray-300 text-sm">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
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
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewPostModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-black/80 rounded-2xl border border-white/10 p-6 max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New Post</h2>
                <button
                  onClick={() => setShowNewPostModal(false)}
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

              <form onSubmit={handleCreatePost} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
                    required
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedCategories.includes(category.id)
                            ? `${category.color} bg-opacity-20 border-white/20 text-white`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        } border`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPostModal(false)}
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
                        Posting...
                      </>
                    ) : (
                      "Create Post"
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