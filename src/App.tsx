import React, { useEffect, useState } from 'react';
import { supabase } from './Services/supabase';
import Today from './Pages/Today';
import HeroSection from './Pages/landing/HeroSection'
import LoginScreen from "./LoginScreen/LoginScreen";


const MainApp = () => {
  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col overflow-hidden">
      <main className='flex-1 relative overflow-hidden'>
        <Today/>
      </main>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);


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
  if (showLogin) return <LoginScreen />;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HeroSection onGetStarted={() => setShowLogin(true)} />
    </div>
  );
}

// Authenticated, show main app
  return <MainApp />;
}

export default App;
