import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";

export const Auth = () => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
      <p className="text-gray-600 mb-6">Inicia sesión para continuar</p>
      <Button
        onClick={handleLogin}
        className="w-full max-w-xs flex items-center justify-center gap-2"
        variant="outline"
      >
        <FcGoogle className="h-5 w-5" />
        Ingresar con Google
      </Button>
    </div>
  );
};