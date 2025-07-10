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

const mockRequests = [
  {
    id: "1",
    employee: "Ana Gómez",
    policy: "Vacaciones",
    days: "0.5 días (Tarde)",
    date: "2025-08-18",
    status: "Aprobado",
  },
  {
    id: "2",
    employee: "Carlos Rivas",
    policy: "Vacaciones",
    days: "3 días",
    date: "2025-09-10 al 2025-09-12",
    status: "Pendiente",
  },
  {
    id: "3",
    employee: "Laura Pausini",
    policy: "Enfermedad",
    days: "1 día",
    date: "2025-07-22",
    status: "Rechazado",
  },
  {
    id: "4",
    employee: "Juan Pérez",
    policy: "WFH",
    days: "1 día",
    date: "2025-07-30",
    status: "Aprobado",
  },
];

export function TimeOffHistory() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "default";
      case "Pendiente":
        return "secondary";
      case "Rechazado":
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
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.employee}</TableCell>
                <TableCell>{request.policy}</TableCell>
                <TableCell>{request.days}</TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}