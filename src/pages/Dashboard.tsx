import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/");
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </header>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p>
            ¡Bienvenido, <strong>{user.user_metadata.full_name}</strong>!
          </p>
          <p>
            Email: <strong>{user.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;