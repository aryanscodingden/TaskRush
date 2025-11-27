import { useEffect, useState } from 'react';
import { LoginScreen } from './LoginScreen/LoginScreen';
import { supabase } from './Services/supabase';
import Today from './Pages/Today';

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
    return <LoginScreen />;
  }

  return <MainApp />;
}

export default App;
