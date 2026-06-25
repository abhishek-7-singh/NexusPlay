"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================
// Login Redesign — Premium Client Aesthetic
// ============================================================

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      localStorage.setItem("nexus_user", JSON.stringify({ 
        id: `guest_${Date.now()}`, 
        name: username,
        isGuest: true 
      }));
      window.location.href = "/games";
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-base-900 z-0" />
      <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-accent-blue/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-accent-purple/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Login Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-base-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-8 sm:p-12 flex flex-col items-center">
          
          {/* Logo */}
          <div className="w-16 h-16 bg-white text-base-900 rounded-xl flex items-center justify-center font-display font-black text-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            N
          </div>

          <h1 className="client-heading-2 text-3xl mb-2 text-center">Welcome Back</h1>
          <p className="text-text-muted text-sm text-center mb-8 font-medium">
            Sign in to access your library, friends, and rankings.
          </p>

          {/* Form */}
          <form onSubmit={handleGuestLogin} className="w-full space-y-4">
            <div>
              <label className="client-label block mb-2">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a cool username..."
                className="w-full bg-base-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all"
                required
                maxLength={20}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold tracking-wide shadow-[0_0_20px_rgba(0,212,255,0.15)]"
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-base-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Play as Guest <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-8 opacity-50">
            <div className="h-px bg-white/20 flex-1" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Or connect with</span>
            <div className="h-px bg-white/20 flex-1" />
          </div>

          {/* Third Party Auth Stubs */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" className="h-11 border-white/10 text-text-secondary hover:text-white">
              <Gamepad2 className="w-4 h-4 mr-2" /> Discord
            </Button>
            <Button variant="outline" className="h-11 border-white/10 text-text-secondary hover:text-white">
              Google
            </Button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
