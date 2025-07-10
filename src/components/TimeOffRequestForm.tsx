import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

// Schema definition
const formSchema = z.object({
  policyId: z.string({ required_error: "Debes seleccionar una política." }),
  requestType: z.enum(["SINGLE_DAY", "MULTI_DAY"]),
  dateRange: z.object({
    from: z.date({ required_error: "La fecha de inicio es obligatoria." }),
    to: z.date().optional(),
  }),
  dayPortion: z.enum(["FULL_DAY", "AM", "PM"]).optional(),
  reason: z.string().optional(),
}).refine(data => {
    if (data.requestType === 'MULTI_DAY') {
        return !!data.dateRange.to;
    }
    return true;
}, {
    message: "La fecha de fin es obligatoria para varios días.",
    path: ["dateRange"],
});

const fetchPolicies = async () => {
  const { data, error } = await supabase.from("time_off_policies").select("id, policy_name");
  if (error) throw new Error(error.message);
  return data;
};

export function TimeOffRequestForm() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const queryClient = useQueryClient();

  const { data: timeOffPolicies, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["timeOffPolicies"],
    queryFn: fetchPolicies,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: "SINGLE_DAY",
      dayPortion: "FULL_DAY",
      reason: "",
    },
  });

  const requestType = form.watch("requestType");
  const dateRange = form.watch("dateRange");

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema> | "dateRange" | "dateRange.from")[] = [];
    if (step === 1) fieldsToValidate = ["policyId"];
    if (step === 2) fieldsToValidate = ["requestType"];
    if (step === 3) fieldsToValidate = ["dateRange"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { policyId, requestType, dateRange, dayPortion, reason } = values;
    
    const { data: { user } } = await supabase.auth.getUser();

    const requestData = {
      policy_id: policyId,
      request_type: requestType,
      start_date: format(dateRange.from, "yyyy-MM-dd"),
      end_date: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      day_portion: requestType === 'SINGLE_DAY' ? dayPortion : undefined,
      reason: reason,
      employee_id: user?.id,
    };

    const { error } = await supabase.from("time_off_requests").insert(requestData);

    if (error) {
      showError("Error al enviar la solicitud: " + error.message);
    } else {
      showSuccess("Solicitud enviada con éxito.");
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      setOpen(false);
      form.reset({ requestType: "SINGLE_DAY", dayPortion: "FULL_DAY", reason: "" });
      setStep(1);
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1: // Policy Selection
        return (
          <FormField
            control={form.control}
            name="policyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paso 1: Tipo de Ausencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLoadingPolicies}>
                      <SelectValue placeholder={isLoadingPolicies ? "Cargando políticas..." : "Selecciona una política"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOffPolicies?.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.policy_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 2: // Day Type Selection
        return (
          <FormField
            control={form.control}
            name="requestType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Paso 2: ¿Cuántos días necesitas?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="SINGLE_DAY" id="single_day" className="sr-only" />
                      </FormControl>
                      <FormLabel htmlFor="single_day" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        Un solo día
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="MULTI_DAY" id="multi_day" className="sr-only" />
                      </FormControl>
                      <FormLabel htmlFor="multi_day" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        Varios días
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 3: // Details
        return (
          <div>
            <h3 className="text-sm font-medium mb-4">Paso 3: Detalles de la Solicitud</h3>
            {requestType === "SINGLE_DAY" ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateRange.from"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Elige una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.setValue("dateRange.to", undefined);
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dayPortion"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Duración</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="FULL_DAY" id="full_day" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="full_day" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                              <span>Día Completo</span>
                              <span className="text-xs text-muted-foreground">(1 día)</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="AM" id="am" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="am" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                              <span>Medio Día (AM)</span>
                              <span className="text-xs text-muted-foreground">(0.5 días)</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="PM" id="pm" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="pm" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                              <span>Medio Día (PM)</span>
                              <span className="text-xs text-muted-foreground">(0.5 días)</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rango de Fechas</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value?.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y", { locale: es })} -{" "}
                                  {format(field.value.to, "LLL dd, y", { locale: es })}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y", { locale: es })
                              )
                            ) : (
                              <span>Elige un rango de fechas</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={{ from: field.value.from, to: field.value.to }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {dateRange?.from && dateRange?.to && (
                  <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground text-center">
                    Total de días solicitados: <span className="font-bold text-foreground">{differenceInCalendarDays(dateRange.to, dateRange.from) + 1}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 4: // Reason
        return (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paso 4: Razón (Opcional)</FormLabel>
                <Textarea
                  placeholder="Escribe una breve descripción del motivo de tu ausencia..."
                  {...field}
                />
                <FormDescription>
                  Esta información será visible para tu manager y RR.HH.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Solicitar Ausencia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Ausencia</DialogTitle>
          <DialogDescription>
            Completa los pasos para enviar tu solicitud.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="min-h-[200px]">
              {renderStepContent()}
            </div>
            <DialogFooter className="flex justify-between w-full">
              {step > 1 && <Button type="button" variant="outline" onClick={handlePrevStep}>Anterior</Button>}
              <div className="flex-grow" />
              {step < 4 && <Button type="button" onClick={handleNextStep}>Siguiente</Button>}
              {step === 4 && <Button type="submit">Enviar Solicitud</Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}