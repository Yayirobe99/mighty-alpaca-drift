import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";

export const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("¡Inicio de sesión exitoso!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Bienvenido de Nuevo</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Inicia sesión para acceder a tu panel.
        </p>
      </div>

      <Button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 mb-4"
        variant="outline"
        disabled={loading}
      >
        <FcGoogle className="h-5 w-5" />
        Ingresar con Google
      </Button>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-xs text-gray-500 uppercase">O</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleLocalLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};