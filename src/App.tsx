import React, { useEffect, useState } from 'react';
import { supabase } from './Services/supabase';
import Today from './Pages/Today';
import HeroSection from './Pages/landing/HeroSection'
import LoginScreen from "./LoginScreen/LoginScreen";
import FocusMode from './Pages/FocusMode';
import { motion, AnimatePresence } from "framer-motion";


const MainApp = ({ setMode, mode }: { setMode: (mode: "todo" | "focus") => void; mode: "todo" | "focus" }) => {
  return (
    <AnimatePresence mode='wait'>
      {mode === "focus" ? (
        <motion.div
          key="focus"
          initial={{ opacity: 0, x: 50, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -50, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className='h-screen w-full'
        >
          <FocusMode
            onBackToTasks={() => setMode("todo")}
            onPickTask={() => setMode("todo")}
          />
        </motion.div>
      ) : (
        <motion.div
          key="todo"
          initial={{ opacity: 0, x: -50, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 50, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className='h-screen w-full bg-zinc-950 text-white flex flex-col overflow-hidden'
        >
          <main className='flex-1 relative overflow-hidden'>
            <Today onSwitchMode={setMode} />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<"todo" | "focus">("todo");


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

if (loading) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-white">Loading..</div>
    </div>
  );
}

if (!session) {
  if (showLogin) {
    return <LoginScreen onAuthSuccess={() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setShowLogin(false);
      });
    }} />;
  }
  return <HeroSection onGetStarted={() => setShowLogin(true)} />; 
}

return <MainApp setMode={setMode} mode={mode} />;
}

export default App;
