"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, BookOpen, FileText, Brain, BarChart2, ChevronRight, Sparkles, Menu, X } from "lucide-react";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  };
}

function fadeView(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  };
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-border"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">S°</span>
          </div>
          <span className="font-black text-ink tracking-tight text-[15px]">
            SKILLPATH <span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-[14px] text-ink-muted hover:text-ink transition-colors font-medium">How it works</a>
          <a href="#features" className="text-[14px] text-ink-muted hover:text-ink transition-colors font-medium">Features</a>
          <a href="#courses" className="text-[14px] text-ink-muted hover:text-ink transition-colors font-medium">Courses</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-[14px] font-semibold text-ink hover:text-primary transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/register" className="bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold px-5 py-2 rounded-full transition-colors">
            Sign up
          </Link>
        </div>

        <button className="md:hidden text-ink" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4">
          <a href="#how-it-works" className="text-[14px] text-ink-muted font-medium" onClick={() => setOpen(false)}>How it works</a>
          <a href="#features" className="text-[14px] text-ink-muted font-medium" onClick={() => setOpen(false)}>Features</a>
          <a href="#courses" className="text-[14px] text-ink-muted font-medium" onClick={() => setOpen(false)}>Courses</a>
          <Link href="/login" className="text-[14px] font-semibold text-ink">Log In</Link>
          <Link href="/register" className="bg-primary text-white text-[14px] font-semibold px-5 py-2 rounded-full text-center">Sign up</Link>
        </div>
      )}
    </nav>
  );
}

function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm bg-white rounded-2xl shadow-card-hover border border-border p-5 animate-float"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-[13px] text-ink-muted font-medium">Roadmap ready! AI built your path</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">AO</div>
          <div>
            <p className="text-[14px] font-bold text-ink">Welcome back, Amaka 👋</p>
            <p className="text-[13px] text-ink-muted">Continue your journey</p>
          </div>
        </div>
        <div className="bg-primary-light text-primary text-[12px] font-semibold px-2 py-1 rounded-full">7 day streak</div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[13px] font-semibold text-ink">Python for Beginners</span>
          <span className="text-[13px] text-ink-muted">68%</span>
        </div>
        <div className="h-1.5 bg-grey-200 rounded-full">
          <div className="h-1.5 bg-primary rounded-full" style={{ width: "68%" }} />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[13px] font-semibold text-ink">JavaScript Essentials</span>
          <span className="text-[13px] text-ink-muted">12%</span>
        </div>
        <div className="h-1.5 bg-grey-200 rounded-full">
          <div className="h-1.5 bg-primary rounded-full" style={{ width: "12%" }} />
        </div>
      </div>

      <div className="bg-grey-100 rounded-xl p-3 mb-3">
        <p className="text-[13px] font-semibold text-ink">Python Fundamentals</p>
        <p className="text-[13px] text-ink-muted">Module 4 of 8 · 12 lessons left</p>
      </div>

      <div className="bg-primary rounded-xl p-3 mb-3">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="text-white mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-white">
            <span className="font-bold">AI Tip:</span> Based on your pace, you will finish Python by Friday!
          </p>
        </div>
      </div>

      <div className="bg-grey-100 rounded-xl p-3 text-right">
        <p className="text-[13px] font-semibold text-ink">PDF Summarised</p>
        <p className="text-[13px] text-ink-muted">AI extracted key notes</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-primary-light text-primary text-[13px] font-semibold px-4 py-1.5 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              AI-Powered Learning for Africa Tech Future
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.1] mb-6">
              Your personal{" "}
              <span className="text-gold">AI roadmap</span>{" "}
              to tech mastery.
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-[17px] text-ink-muted max-w-md mb-8 leading-relaxed">
              SkillPath AI builds a personalised learning journey just for you — from web development to data science — designed for African learners, from beginner to pro.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="flex items-center gap-4">
              <span className="text-[14px] text-ink-muted font-medium italic">Hey, Intuitive!</span>
              <Link href="/register" className="bg-primary hover:bg-primary-dark text-white font-bold px-7 py-3 rounded-full transition-all text-[14px]">
                Start Learning
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.4)} className="flex items-center gap-10 mt-14">
              <div>
                <p className="text-2xl font-black text-ink">12,000+</p>
                <p className="text-[13px] text-ink-muted mt-0.5">Active learners</p>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">95%</p>
                <p className="text-[13px] text-ink-muted mt-0.5">Completion rate</p>
              </div>
              <div>
                <p className="text-2xl font-black text-ink">200+</p>
                <p className="text-[13px] text-ink-muted mt-0.5">Courses available</p>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <motion.p {...fadeView(0)} className="text-[12px] font-bold tracking-widest uppercase text-primary mb-3">HOW IT WORKS</motion.p>
          <motion.h2 {...fadeView(0.1)} className="text-4xl font-black text-ink tracking-tight mb-3">Get started in 3 simple steps</motion.h2>
          <motion.p {...fadeView(0.2)} className="text-[15px] text-ink-muted mb-12 max-w-md">No confusion, no overwhelm. SkillPath AI guides your learning journey every step of the way.</motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div {...fadeView(0)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm mb-4">1</div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Tell us your goals</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Answer 3 quick questions — what you want to learn, your experience level, and how much time you have each day.</p>
            </motion.div>

            <motion.div {...fadeView(0.15)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm mb-4">2</div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Get your AI roadmap</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Our AI instantly creates a personalised course roadmap built around your goals, pace, and learning style — just for you.</p>
            </motion.div>

            <motion.div {...fadeView(0.3)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm mb-4">3</div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Learn and grow daily</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Follow structured lessons, take quizzes, upload PDFs for AI summarisation, and track your progress every single day.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p {...fadeView(0)} className="text-[12px] font-bold tracking-widest uppercase text-primary mb-3">FEATURES</motion.p>
          <motion.h2 {...fadeView(0.1)} className="text-4xl font-black text-ink tracking-tight mb-3">Everything you need to succeed in tech</motion.h2>
          <motion.p {...fadeView(0.2)} className="text-[15px] text-ink-muted mb-12 max-w-md">Built with African learners in mind — welcoming, structured, and confidence-building at every step.</motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div {...fadeView(0)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <Map size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">AI-Personalised Roadmaps</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Get a custom learning path generated by AI based on your goals, skill level, and available study time each day.</p>
            </motion.div>

            <motion.div {...fadeView(0.1)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <BookOpen size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Structured Course Library</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">70+ organised courses covering web dev, data science, UI/UX, Python, and more — from beginner to intermediate.</p>
            </motion.div>

            <motion.div {...fadeView(0.2)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <FileText size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">PDF AI Summariser</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Upload any PDF — textbooks, articles, docs — and our AI extracts key notes and a clean summary in seconds.</p>
            </motion.div>

            <motion.div {...fadeView(0.3)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <Brain size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Smart Quizzes</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Test your knowledge after each module with adaptive quizzes that help you retain what you have learned longer.</p>
            </motion.div>

            <motion.div {...fadeView(0.4)} className="bg-white rounded-2xl p-6 border border-border shadow-card-default hover:shadow-card-hover transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <BarChart2 size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Progress Tracking</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">Visualise your growth with an intuitive dashboard — see streaks, completion rates, and exactly what is coming next.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeView(0)} className="bg-sidebar rounded-3xl px-10 py-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Ready to build your{" "}
              <span className="text-gold">tech future?</span>
            </h2>
            <p className="text-[17px] text-ink-faint mb-8 max-w-lg mx-auto">
              Join 70+ learners already on their SkillPath. It is completely free to start.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full transition-all text-[15px]">
              Get Started Free
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-sidebar py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">S°</span>
                </div>
                <span className="font-black text-white tracking-tight text-[15px]">
                  SKILLPATH <span className="text-gold">AI</span>
                </span>
              </div>
              <p className="text-[13px] text-ink-faint leading-relaxed">AI-powered tech learning built for African learners</p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="text-[13px] font-bold text-white mb-4 uppercase tracking-wide">Learn</p>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">All Courses</a>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">Web Development</a>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">Data Science</a>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">UI/UX Design</a>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white mb-4 uppercase tracking-wide">Platform</p>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">How it works</a>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">AI Roadmap</a>
                <a href="#" className="block text-[13px] text-ink-faint hover:text-white transition-colors mb-2">PDF Summariser</a>
              </div>
            </div>
          </div>

          <div className="border-t border-sidebar-header pt-6 text-center">
            <p className="text-[13px] text-ink-faint">
              © 2026 SkillPath AI. All rights reserved. Built with 🤍 for Africa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}