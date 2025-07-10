import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type TimeOffRequest = Database["public"]["Tables"]["time_off_requests"]["Row"] & {
  time_off_policies: Pick<Database["public"]["Tables"]["time_off_policies"]["Row"], "policy_name"> | null;
};

interface TimeOffRequestsTableProps {
  requests: TimeOffRequest[];
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  pending: "secondary",
  approved_by_manager: "default",
  acknowledged_by_hr: "outline",
  rejected: "destructive",
};

export function TimeOffRequestsTable({ requests }: TimeOffRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        No tienes solicitudes de ausencia todavía.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de Ausencia</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.time_off_policies?.policy_name ?? "N/A"}</TableCell>
            <TableCell>
              {request.request_type === "SINGLE_DAY"
                ? format(new Date(request.start_date), "PPP", { locale: es })
                : `${format(new Date(request.start_date), "P", { locale: es })} - ${format(new Date(request.end_date!), "P", { locale: es })}`}
              {request.day_portion && request.day_portion !== "FULL_DAY" && (
                <span className="text-muted-foreground ml-2">({request.day_portion})</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[request.status] || "default"}>
                {request.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}