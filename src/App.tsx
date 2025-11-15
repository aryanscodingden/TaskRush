import { useEffect, useState } from 'react';
import type { SupabaseClient } from "@supabase/supabase-js";
import LoginScreen from "@/LoginScreen/LoginScreen";
import { supabase } from "@/Services/supabase";
import { Zap } from "lucide-react";

const TaskRushLogo = () => (
  <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-md p-1.5 shadow-lg">
    <Zap className="h-4 w-4" />
  </div>
);

const MainApp = ({ supabaseClient }: { supabaseClient: SupabaseClient }) => {
  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TaskRushLogo />
            <h1 className="text-2xl font-bold text-foreground">TaskRush</h1>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Out
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Welcome to TaskRush!</h2>
          <p className="text-muted-foreground">You're successfully logged in. Your main app content goes here.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const supabaseClient = supabase;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Supabase configuration required</h1>
          <p className="text-muted-foreground">
            Please set the <code className="font-mono">REACT_APP_SUPABASE_URL</code> and
            {' '}
            <code className="font-mono">REACT_APP_SUPABASE_ANON_KEY</code> environment variables in your <code className="font-mono">.env</code> file.
          </p>
          <p className="text-sm text-muted-foreground">
            Once configured, restart the development server to connect to Supabase.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginScreen 
        logo={<TaskRushLogo />} 
        brandName="TaskRush"
        onAuthSuccess={() => {
       
        }}
      />
    );
  }

  return <MainApp supabaseClient={supabaseClient} />;
}

export default App;