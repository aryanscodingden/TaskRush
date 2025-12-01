import React, { useEffect, useState } from 'react';
import { supabase } from './Services/supabase';
import Today from './Pages/Today';
import HeroSection from './Pages/landing/HeroSection'
import LoginScreen from "./LoginScreen/LoginScreen";
import FocusMode from './Pages/FocusMode';
import { Main } from 'next/document';


const MainApp = ({ setMode }: { setMode: (mode: "todo" | "focus") => void }) => {
  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col overflow-hidden">
      <main className='flex-1 relative overflow-hidden'>
        <Today onSwitchMode={setMode} />
      </main>
    </div>
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

return mode === "focus" ? (
  <FocusMode
    onBackToTasks={() => setMode("todo")}
    onPickTask={() => setMode("todo")}
  />
) : (
  <MainApp setMode={setMode} />
);
}

export default App;
