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
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showError } from "@/utils/toast";

type Request = {
  id: string;
  employee_name: string;
  policy_name: string;
  date_range: string;
  total_days: number;
  status: "solicitado" | "aprobado" | "rechazado";
};

export function AllRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_off_requests")
      .select(
        `
        id,
        start_date,
        end_date,
        total_days,
        status,
        profiles (display_name),
        time_off_policies (policy_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      showError("Error al cargar las solicitudes.");
      console.error("Error fetching all requests:", error);
    } else {
      const formattedData = data.map((req: any) => ({
        id: req.id,
        employee_name: req.profiles?.display_name || "N/A",
        policy_name: req.time_off_policies?.policy_name || "N/A",
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
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "aprobado":
        return "default";
      case "solicitado":
        return "secondary";
      case "rechazado":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas las Solicitudes de Ausencia</CardTitle>
        <CardDescription>
          Una vista global de todas las solicitudes en la empresa.
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
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(req.status)}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay solicitudes en el sistema.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}