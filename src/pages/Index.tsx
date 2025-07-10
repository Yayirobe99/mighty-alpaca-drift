import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          Bienvenido a la Aplicación de RR.HH.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Gestiona empleados, políticas y solicitudes de ausencia de forma centralizada.
        </p>
      </div>

      <div className="mt-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Portal de Ausencias</CardTitle>
            <CardDescription>
              Crea y gestiona tus solicitudes de tiempo libre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/time-off">
              <Button className="w-full">
                Ir al Portal de Ausencias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;