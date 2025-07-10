import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showError, showSuccess } from "@/utils/toast";

type TeamRequest = {
  id: number;
  employee_name: string;
  policy_name: string;
  date_range: string;
  total_days: number;
  status: string;
};

export function TeamRequests() {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_team_requests");

    if (error) {
      showError("Error al cargar las solicitudes del equipo.");
      console.error("Error fetching team requests:", error);
    } else {
      const formattedData = data.map((req: any) => ({
        id: req.request_id,
        employee_name: req.employee_name,
        policy_name: req.policy_name,
        date_range:
          req.start_date === req.end_date
            ? format(new Date(req.start_date), "PPP", { locale: es })
            : `${format(new Date(req.start_date), "PPP", {
                locale: es,
              })} - ${format(new Date(req.end_date), "PPP", { locale: es })}`,
        total_days: req.total_days,
        status: req.status,
      }));
      setRequests(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamRequests();
  }, []);

  const handleUpdateRequest = async (id: number, status: "aprobado" | "rechazado") => {
    const { error } = await supabase
      .from("time_off_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      showError(`Error al ${status === "aprobado" ? "aprobar" : "rechazar"} la solicitud.`);
    } else {
      showSuccess(`Solicitud ${status === "aprobado" ? "aprobada" : "rechazada"} con éxito.`);
      // Refresh the list
      fetchTeamRequests();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes Pendientes del Equipo</CardTitle>
        <CardDescription>
          Aprueba o rechaza las solicitudes de los miembros de tu equipo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Política</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Días</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.employee_name}</TableCell>
                  <TableCell>{req.policy_name}</TableCell>
                  <TableCell>{req.date_range}</TableCell>
                  <TableCell>{req.total_days}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleUpdateRequest(req.id, "aprobado")}>Aprobar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest(req.id, "rechazado")}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay solicitudes pendientes en tu equipo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}