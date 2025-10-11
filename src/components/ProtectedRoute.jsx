// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
      } else {
        setSession(session);
      }
      setLoading(false);
    };

    checkSession();

    // 🔁 Real-time listener for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-sky-700 font-medium">
        Checking authentication...
      </div>
    );

  if (!session) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
