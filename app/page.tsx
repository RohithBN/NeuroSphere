import Link from "next/link";
import { MdOutlinePsychology } from "react-icons/md";
import { RiLungsFill } from "react-icons/ri";
import { TbMoodSearch } from "react-icons/tb";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { GiNightSleep } from "react-icons/gi";
import { GiDualityMask } from "react-icons/gi";
import { GiMeditation } from "react-icons/gi";
import { RiUserCommunityLine } from "react-icons/ri";
import Navbar from "@/components/Navbar";

// Navbar items
const navItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "Community", href: "#community" },
  { name: "About", href: "#about" },
];

// Feature items with expanded descriptions
const features = [
  {
    name: "AI Therapist",
    tagline: "Your 24/7 mental health companion",
    desc: "Engage in confidential conversations with our advanced LLM therapist. Process emotions, gain insights, and receive guidance tailored to your unique mental health journey.",
    icon: <MdOutlinePsychology className='w-10 h-10 text-white'/>,
  },
  {
    name: "Breathing Center",
    tagline: "Breathe your way to clarity",
    desc: "Access scientifically proven breathing techniques that help reduce anxiety, improve focus, and restore calm. Visualize your breathing patterns and track your progress over time.",
    icon: <RiLungsFill className='w-10 h-10 text-white'/>,
  },
  {
    name: "Sleep Analytics",
    tagline: "Unlock restorative sleep",
    desc: "Monitor your sleep cycles, recognize patterns, and optimize your rest. Receive personalized recommendations based on your unique sleep profile and habits.",
    icon: <GiNightSleep className='w-10 h-10 text-white'/>,
  },
  {
    name: "Mood Tracking",
    tagline: "Understand your emotional landscape",
    desc: "Visualize your emotional patterns with elegant, insightful analytics. Identify triggers, celebrate improvements, and gain deeper self-awareness through data.",
    icon: <TbMoodSearch className='w-10 h-10 text-white'/>,
  },
  {
    name: "Mental Memes",
    tagline: "Laughter is the best medicine",
    desc: "Enjoy curated, mindfulness-promoting memes that offer moments of levity and perspective. A gentle reminder not to take life too seriously.",
    icon: <GiDualityMask className='w-10 h-10 text-white'/>,
  },
  {
    name: "Focus Space",
    tagline: "Train your mind, nurture your spirit",
    desc: "Explore minigames, curated playlists, and activities designed to strengthen focus, reduce stress, and provide therapeutic mental breaks.",
    icon: <GiMeditation className='w-10 h-10 text-white'/>, 
  },
  {
    name: "Community Connection",
    tagline: "You're never alone in this journey",
    desc: "Join a supportive community of individuals on similar paths. Share experiences, offer support, and learn from others in moderated, safe discussion spaces.",
    icon: <RiUserCommunityLine className="w-10 h-10 text-white"/>,
  },
  {
    name:"Journal Center",
    tagline: "Reflect, express, and grow",
    desc: "Capture your thoughts, feelings, and experiences in a secure digital journal. Use guided prompts or freeform entries to explore your inner world.",
    icon: <BsFillJournalBookmarkFill className='w-10 h-10 text-white'/>,
  }
];

export default function Home() {
  return (
    <>
      {/* Fixed Navbar with glassmorphism */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a]">
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-gray-800/40 to-transparent blur-3xl"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-gray-800/40 to-transparent blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
                Redefine Your <br />
                <span className="block mt-2">Mental Wellness</span>
              </h1>
              <p className="mt-6 text-gray-400 text-lg sm:text-xl max-w-xl">
                NeuroSphere harnesses AI and neuroscience to provide personalized mental wellness tools that evolve with you. Experience clarity like never before.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                <button className="bg-white text-black py-3 px-8 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300 shadow-lg shadow-white/10">
                  Start Your Journey
                </button>
                <button className="bg-transparent border border-white/25 text-white py-3 px-8 rounded-full font-medium hover:bg-white/10 transition-colors duration-300">
                  Explore Features
                </button>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">97%</div>
                  <div className="text-xs text-gray-400 mt-1">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs text-gray-400 mt-1">AI Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Active</div>
                  <div className="text-xs text-gray-400 mt-1">Online Community</div>
                </div>
              </div>
            </div>
            
            {/* Hero visual */}
            <div className="w-full lg:w-1/2">
              <div className="relative h-[400px] md:h-[500px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 to-black/30 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm shadow-xl">
                  <div className="absolute inset-0 bg-[url('/abstract-pattern.jpg')] bg-center bg-no-repeat bg-cover mix-blend-overlay opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent"></div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-[20%] left-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border border-white/10 shadow-lg animate-float-slow"></div>
                  <div className="absolute top-[60%] right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-md border border-white/20 shadow-lg animate-float"></div>
                  <div className="absolute top-[40%] right-[30%] w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border border-white/10 shadow-lg animate-float-medium"></div>
                  
                  {/* Central element */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-xl shadow-2xl flex items-center justify-center border border-white/30">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-inner">
                      <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">NS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Comprehensive Tools for Complete Wellness
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Every aspect of your mental wellness journey supported by thoughtfully designed features that work together seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-500 shadow-lg"
              >
                {/* Subtle hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Feature content */}
                <div className="p-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 shadow-lg mb-6 group-hover:shadow-white/5 transition-all duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 font-medium">
                    {feature.tagline}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {feature.desc}
                  </p>
                  
                  <div className="mt-8 pt-4 border-t border-white/5">
                    <button className="text-gray-400 text-sm hover:text-white flex items-center transition-colors duration-300">
                      Explore feature
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="community" className="py-24 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-gray-800/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-gray-800/20 to-transparent blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Join a Thriving Community
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Hear from people who have transformed their mental wellness journey with NeuroSphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AJ</span>
                </div>
                <div>
                  <p className="text-white font-medium">Siddharth Bijapur</p>
                  <p className="text-gray-500 text-xs">Using NeuroSphere for 8 months</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "The AI therapist feature has been revolutionary for my anxiety. Having someone to talk to at 3 AM when I'm spiraling has literally been life-changing."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <div>
                  <p className="text-white font-medium">Shashwath A R</p>
                  <p className="text-gray-500 text-xs">Using NeuroSphere for 1 year</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "The breathing exercises have completely transformed how I handle stress. I've seen my sleep score improve by 40% since I started using the app consistently."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">RK</span>
                </div>
                <div>
                  <p className="text-white font-medium">Prasanna G</p>
                  <p className="text-gray-500 text-xs">Using NeuroSphere for 6 months</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "The community forums helped me realize I wasn't alone in my struggles. The support I've received has been invaluable, especially during tough times."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button className="bg-white/10 hover:bg-white/15 text-white py-3 px-8 rounded-full font-medium border border-white/25 transition-all duration-300 shadow-lg hover:shadow-white/5">
              Join Our Community
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-center opacity-5"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
                  Begin Your Mental Wellness Journey Today
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                  Join thousands who have transformed their mental health with NeuroSphere. Your path to clarity starts with a single step.
                </p>
                <button className="bg-white text-black py-3 px-8 rounded-full font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                  Get Started For Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-white font-bold tracking-tight">NeuroSphere</span>
              </div>
              <p className="text-gray-500 text-sm">
                Redefining mental wellness through technology and human connection.
              </p>
            </div>

            <div>
              <h3 className="text-gray-300 font-medium mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">AI Therapist</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Breathing Center</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Sleep Analytics</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-300 font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-300 font-medium mb-4">Stay Connected</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm5.6-3.06a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/></svg>
                </a>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Subscribe to our newsletter</p>
                <div className="mt-2 flex">
                  <input type="email" placeholder="Your email" className="bg-white/5 border border-white/10 rounded-l-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 flex-grow" />
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-r-full px-4 py-2 text-sm text-white">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} NeuroSphere. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link href="#" className="text-gray-500 text-xs hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}