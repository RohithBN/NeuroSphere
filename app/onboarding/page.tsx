"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

type FormData = {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  goals: string[];
};

const goals = [
  { id: "reduce-anxiety", label: "Reduce Anxiety" },
  { id: "improve-sleep", label: "Improve Sleep Quality" },
  { id: "mindfulness", label: "Practice Mindfulness" },
  { id: "manage-stress", label: "Manage Stress" },
  { id: "boost-mood", label: "Boost Mood" },
  { id: "self-discovery", label: "Self Discovery" },
  { id: "improve-focus", label: "Improve Focus" },
  { id: "build-resilience", label: "Build Resilience" }
];

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    occupation: "",
    goals: []
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    // Redirect if no user is logged in
    router.push("/login");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev) => {
      if (prev.goals.includes(goalId)) {
        return {
          ...prev,
          goals: prev.goals.filter((id) => id !== goalId)
        };
      } else {
        return {
          ...prev,
          goals: [...prev.goals, goalId]
        };
      }
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.age) {
        setError("Please fill in all required fields");
        return;
      }
      if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
        setError("Please enter a valid age");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on the final step, just go to next step
    if (currentStep < 3) {
      nextStep();
      return;
    }
    
    setIsLoading(true);
    setError("");
  
    try {
      // Save user profile in Firestore
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          email: user.email,
          age: Number(formData.age),
          gender: formData.gender,
          occupation: formData.occupation,
          goals: formData.goals,
          createdAt: new Date().toISOString()
        });
        
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Let's get to know you</h2>
            <p className="text-gray-400">We'll personalize your experience based on your information.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  What should we call you?
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-colors"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-medium text-gray-300">
                  Your age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-colors"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">A bit more about you</h2>
            <p className="text-gray-400">This helps us customize content that's relevant to you.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-colors"
                >
                  <option value="" disabled>Select gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-300">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Your occupation"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What are your goals?</h2>
            <p className="text-gray-400">Select all that apply to personalize your experience.</p>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
                {goals.map((goal) => (
                    <div key={goal.id} className="col-span-1">
                    <button
                        type="button"
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`w-full h-full p-4 rounded-xl border ${
                        formData.goals.includes(goal.id)
                            ? "border-white/30 bg-white/10"
                            : "border-white/5 bg-white/5 hover:bg-white/10"
                        } transition-colors text-left flex items-center`}
                    >
                        <div className="flex items-center w-full">
                        <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                            formData.goals.includes(goal.id)
                            ? "bg-white"
                            : "border border-white/30"
                        }`}></div>
                        <span className="text-white text-sm">{goal.label}</span>
                        </div>
                    </button>
                    </div>
                ))}
                </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-radial from-gray-800/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-gradient-radial from-gray-800/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/20 shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-xl">NS</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome to NeuroSphere
          </h1>
          <p className="text-gray-400 mt-2">Let's set up your profile</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6">
            {/* Progress indicator */}
            <div className="flex items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 relative">
                  <div
                    className={`w-full h-1 ${
                      step <= currentStep ? "bg-white" : "bg-white/20"
                    } transition-colors duration-300`}
                  ></div>
                  <div
                    className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                      step < currentStep
                        ? "bg-white"
                        : step === currentStep
                        ? "bg-gray-300"
                        : "bg-white/20"
                    } transition-colors duration-300`}
                  ></div>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-white text-sm hover:underline"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-white text-black py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-white text-black py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Saving..." : "Complete Setup"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}