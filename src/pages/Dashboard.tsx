import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const { role, loading: roleLoading } = useUserRole(user);
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

  if (!user || roleLoading) {
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <p>
            ¡Bienvenido, <strong>{user.user_metadata.full_name}</strong>!
          </p>
          <p>
            Email: <strong>{user.email}</strong>
          </p>
          <p>
            Rol: <span className="font-semibold">{role || "Empleado"}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/time-off">
            <Card className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Portal de Ausencias <ArrowRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Solicita días libres y consulta tu historial.
                </p>
              </CardContent>
            </Card>
          </Link>

          {role === "Super Administrador" && (
             <Link to="/manager/dashboard">
               <Card className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                 <CardHeader>
                   <CardTitle className="flex justify-between items-center">
                     Panel de Manager <ArrowRight className="h-5 w-5" />
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-gray-600 dark:text-gray-400">
                     Gestiona las solicitudes de tu equipo.
                   </p>
                 </CardContent>
               </Card>
             </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;