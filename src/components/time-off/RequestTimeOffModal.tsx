import { useState } from "react";
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
import { showSuccess } from "@/utils/toast";
import type { DateRange } from "react-day-picker";

type Step = 1 | 2 | 3 | 4;
type DayType = "single" | "multiple";

export function RequestTimeOffModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [policy, setPolicy] = useState<string>("");
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [singleDate, setSingleDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [duration, setDuration] = useState<string>("1");
  const [schedule, setSchedule] = useState<string | undefined>();
  const [reason, setReason] = useState<string>("");

  const resetState = () => {
    setStep(1);
    setPolicy("");
    setDayType(null);
    setSingleDate(undefined);
    setDateRange(undefined);
    setDuration("1");
    setSchedule(undefined);
    setReason("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para enviar los datos a un backend.
    console.log({
      policy,
      dayType,
      singleDate,
      dateRange,
      duration,
      schedule,
      reason,
    });
    showSuccess("¡Solicitud enviada con éxito!");
    handleOpenChange(false);
  };

  const totalDays =
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
          {/* Paso 1: Tipo de Ausencia */}
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="policy">Tipo de Ausencia</Label>
              <Select value={policy} onValueChange={setPolicy}>
                <SelectTrigger id="policy">
                  <SelectValue placeholder="Selecciona una política" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacaciones</SelectItem>
                  <SelectItem value="wfh">Trabajo desde casa (WFH)</SelectItem>
                  <SelectItem value="sick">Licencia por enfermedad</SelectItem>
                  <SelectItem value="personal">Día personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Paso 2: ¿Cuántos días? */}
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

          {/* Paso 3: Detalles */}
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
                  <ToggleGroupItem value="custom">Personalizado</ToggleGroupItem>
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
                      <SelectItem value="morning">Mañana (8am - 12pm)</SelectItem>
                      <SelectItem value="afternoon">Tarde (1pm - 5pm)</SelectItem>
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
                          {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
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
              {totalDays > 0 && (
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Total de días solicitados:{" "}
                  <span className="font-bold">{totalDays}</span>
                </p>
              )}
            </div>
          )}

          {/* Paso 4: Razón */}
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
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1 as Step)}>
              Anterior
            </Button>
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
            <Button onClick={handleSubmit} className="ml-auto">
              Enviar Solicitud
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}