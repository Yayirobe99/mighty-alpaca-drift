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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showError } from "@/utils/toast";

type FormattedRequest = {
  id: string;
  employee: string;
  policy: string;
  days: string;
  date: string;
  status: "solicitado" | "aprobado" | "rechazado";
};

export function TimeOffHistory() {
  const [requests, setRequests] = useState<FormattedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("time_off_requests")
          .select(
            `
            id,
            start_date,
            end_date,
            total_days,
            status,
            time_off_policies (policy_name),
            profiles (display_name)
          `
          )
          .eq("employee_id", user.id)
          .order("start_date", { ascending: false });

        if (error) {
          showError("Error al cargar el historial de solicitudes.");
          console.error("Error fetching time off requests:", error);
        } else if (data) {
          const formattedData = data.map((req: any) => ({
            id: req.id,
            employee: req.profiles?.display_name || user.email || "N/A",
            policy: req.time_off_policies?.policy_name || "N/A",
            days: `${req.total_days} día(s)`,
            date:
              req.start_date === req.end_date
                ? format(new Date(req.start_date), "PPP", { locale: es })
                : `${format(new Date(req.start_date), "PPP", {
                    locale: es,
                  })} al ${format(new Date(req.end_date), "PPP", {
                    locale: es,
                  })}`,
            status: req.status,
          }));
          setRequests(formattedData);
        }
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

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
        <CardTitle>Historial de Solicitudes</CardTitle>
        <CardDescription>
          Aquí puedes ver tus solicitudes de ausencia pasadas y actuales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Política</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Fecha(s)</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.employee}
                  </TableCell>
                  <TableCell>{request.policy}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No has realizado ninguna solicitud todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}