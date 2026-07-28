import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass rounded-full px-5 py-2.5 flex items-center justify-between shadow-card">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">
              Uppseekers <span className="hidden sm:inline text-muted-foreground font-normal">— Common Admission App</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#universities" className="hover:text-foreground transition">Universities</a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to="/onboarding"
                className="inline-flex items-center rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition shadow-card"
              >
                My application
              </Link>
            ) : (
              <Link to="/signup" className="inline-flex items-center rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition shadow-card">
                Get started
              </Link>
            )}

          </div>
        </div>
      </div>
    </motion.header>
  );
}
