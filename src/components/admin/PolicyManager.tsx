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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const policySchema = z.object({
  policy_name: z.string().min(3, "El nombre es requerido."),
  description: z.string().optional(),
  days_per_year: z.coerce.number().min(1, "Debe ser al menos 1."),
});

type Policy = {
  id: number;
  policy_name: string;
  description: string | null;
  days_per_year: number;
};

export function PolicyManager() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof policySchema>>({
    resolver: zodResolver(policySchema),
  });

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_off_policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError("Error al cargar las políticas.");
    } else {
      setPolicies(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const onSubmit = async (values: z.infer<typeof policySchema>) => {
    const { error } = await supabase.from("time_off_policies").insert([values]);
    if (error) {
      showError(`Error al crear la política: ${error.message}`);
    } else {
      showSuccess("Política creada con éxito.");
      reset();
      setIsDialogOpen(false);
      fetchPolicies(); // Refresh list
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestionar Políticas de Ausencia</CardTitle>
          <CardDescription>
            Crea y edita las políticas de tiempo libre para la empresa.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Política</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Política de Ausencia</DialogTitle>
              <DialogDescription>
                Completa los detalles para la nueva política.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="policy_name">Nombre de la Política</Label>
                <Input id="policy_name" {...register("policy_name")} />
                {errors.policy_name && <p className="text-red-500 text-sm mt-1">{errors.policy_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="days_per_year">Días por Año</Label>
                <Input id="days_per_year" type="number" {...register("days_per_year")} />
                {errors.days_per_year && <p className="text-red-500 text-sm mt-1">{errors.days_per_year.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea id="description" {...register("description")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Política"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Días/Año</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policy_name}</TableCell>
                  <TableCell>{policy.days_per_year}</TableCell>
                  <TableCell>{policy.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}