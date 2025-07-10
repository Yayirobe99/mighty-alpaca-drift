import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import type { DateRange } from "react-day-picker";

type Step = 1 | 2 | 3 | 4;
type DayType = "single" | "multiple";
type Policy = {
  id: string;
  policy_name: string;
};

export function RequestTimeOffModal({
  onRequestSubmitted,
}: {
  onRequestSubmitted: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [policy, setPolicy] = useState<string>("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [singleDate, setSingleDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [duration, setDuration] = useState<string>("1");
  const [schedule, setSchedule] = useState<string | undefined>();
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPolicies = async () => {
      const { data, error } = await supabase
        .from("time_off_policies")
        .select("id, policy_name");

      if (error) {
        console.error("Error fetching policies:", error);
        showError("No se pudieron cargar las políticas de ausencia.");
      } else {
        setPolicies(data);
      }
    };
    fetchPolicies();
  }, [isOpen]);

  const resetState = () => {
    setStep(1);
    setPolicy("");
    setDayType(null);
    setSingleDate(undefined);
    setDateRange(undefined);
    setDuration("1");
    setSchedule(undefined);
    setReason("");
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(resetState, 300); // Delay reset to allow for closing animation
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showError("Debes iniciar sesión para hacer una solicitud.");
      setIsSubmitting(false);
      return;
    }

    let startDate, endDate, totalDays;

    if (dayType === "single") {
      if (!singleDate) {
        showError("Por favor, selecciona una fecha.");
        setIsSubmitting(false);
        return;
      }
      startDate = singleDate;
      endDate = singleDate;
      totalDays = parseFloat(duration);
    } else {
      if (!dateRange?.from || !dateRange?.to) {
        showError("Por favor, selecciona un rango de fechas.");
        setIsSubmitting(false);
        return;
      }
      startDate = dateRange.from;
      endDate = dateRange.to;
      totalDays = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    }

    const requestData = {
      employee_id: user.id,
      policy_id: policy,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      total_days: totalDays,
      reason: reason,
      status: "solicitado",
    };

    const { error } = await supabase
      .from("time_off_requests")
      .insert([requestData]);

    if (error) {
      showError(`Error al enviar la solicitud: ${error.message}`);
    } else {
      showSuccess("¡Solicitud enviada con éxito!");
      handleOpenChange(false);
      onRequestSubmitted();
    }
    setIsSubmitting(false);
  };

  const totalDaysCalculated =
    dateRange?.from && dateRange?.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
      : 0;

  const isNextDisabled = () => {
    if (step === 1 && !policy) return true;
    if (step === 2 && !dayType) return true;
    if (step === 3) {
      if (dayType === "single" && !singleDate) return true;
      if (dayType === "multiple" && (!dateRange?.from || !dateRange?.to))
        return true;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Solicitar Ausencia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Ausencia</DialogTitle>
          <DialogDescription>
            {step < 4
              ? `Paso ${step} de 4: Completa la información requerida.`
              : "Paso 4 de 4: Revisa y envía tu solicitud."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="policy">Tipo de Ausencia</Label>
              <Select value={policy} onValueChange={setPolicy}>
                <SelectTrigger id="policy">
                  <SelectValue placeholder="Selecciona una política" />
                </SelectTrigger>
                <SelectContent>
                  {policies.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.policy_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <Label>¿Cuántos días necesitas?</Label>
              <div className="flex justify-center gap-4">
                <Button
                  variant={dayType === "single" ? "default" : "outline"}
                  onClick={() => setDayType("single")}
                  className="w-32 h-20 text-base"
                >
                  Un solo día
                </Button>
                <Button
                  variant={dayType === "multiple" ? "default" : "outline"}
                  onClick={() => setDayType("multiple")}
                  className="w-32 h-20 text-base"
                >
                  Varios días
                </Button>
              </div>
            </div>
          )}

          {step === 3 && dayType === "single" && (
            <div className="space-y-4">
              <div>
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !singleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {singleDate ? (
                        format(singleDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={setSingleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Duración</Label>
                <ToggleGroup
                  type="single"
                  value={duration}
                  onValueChange={(value) => value && setDuration(value)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="1">Día Completo (1)</ToggleGroupItem>
                  <ToggleGroupItem value="0.5">Medio Día (0.5)</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {parseFloat(duration) < 1 && (
                <div>
                  <Label>Horario</Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Mañana</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 3 && dayType === "multiple" && (
            <div className="space-y-4">
              <Label>Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "LLL dd, y", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", { locale: es })
                      )
                    ) : (
                      <span>Selecciona un rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {totalDaysCalculated > 0 && (
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Total de días solicitados:{" "}
                  <span className="font-bold">{totalDaysCalculated}</span>
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="reason">Razón (Opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Escribe una breve razón para tu solicitud..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between w-full">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1 as Step)}
              disabled={isSubmitting}
            >
              Anterior
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1 as Step)}
              disabled={isNextDisabled()}
              className="ml-auto"
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="ml-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}