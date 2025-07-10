import { TimeOffRequestForm } from "@/components/TimeOffRequestForm";
import { TimeOffRequestsTable } from "@/components/TimeOffRequestsTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const fetchRequests = async () => {
  const { data, error } = await supabase
    .from("time_off_requests")
    .select(`
      *,
      time_off_policies (
        policy_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching requests:", error);
    throw new Error(error.message);
  }
  return data;
};

const TimeOffPage = () => {
  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["timeOffRequests"],
    queryFn: fetchRequests,
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portal de Ausencias</h1>
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
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {isError && (
              <p className="text-destructive">
                No se pudieron cargar las solicitudes. Inténtalo de nuevo más tarde.
              </p>
            )}
            {requests && <TimeOffRequestsTable requests={requests} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeOffPage;