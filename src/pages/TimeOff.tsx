import { TimeOffRequestForm } from "@/components/TimeOffRequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TimeOffPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portal de Ausencias (Time Off)</h1>
        <p className="text-muted-foreground">Gestiona tus solicitudes de ausencia.</p>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Solicitud de Ausencia</CardTitle>
            <CardDescription>
              Crea una nueva solicitud de vacaciones, día por enfermedad, o trabajo desde casa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOffRequestForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes</CardTitle>
            <CardDescription>
              Revisa el historial y el estado de tus solicitudes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí se mostrará la tabla con tus solicitudes de ausencia.
            </p>
            {/* Placeholder for the requests table */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeOffPage;