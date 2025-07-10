import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamRequests } from "@/components/manager/TeamRequests";
import { TimeOffHistory } from "@/components/time-off/TimeOffHistory";

const ManagerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Panel de Manager
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tu equipo y tus propias ausencias.
          </p>
        </header>
        <Tabs defaultValue="team-requests">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="team-requests">Solicitudes del Equipo</TabsTrigger>
            <TabsTrigger value="my-requests">Mis Solicitudes</TabsTrigger>
          </TabsList>
          <TabsContent value="team-requests">
            <TeamRequests />
          </TabsContent>
          <TabsContent value="my-requests">
            {/* Reutilizamos el componente de historial personal */}
            <TimeOffHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;