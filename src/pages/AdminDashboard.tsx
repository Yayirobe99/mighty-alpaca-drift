import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllRequests } from "@/components/admin/AllRequests";
import { PolicyManager } from "@/components/admin/PolicyManager";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las ausencias y políticas de toda la empresa.
          </p>
        </header>
        <Tabs defaultValue="all-requests">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="all-requests">Todas las Solicitudes</TabsTrigger>
            <TabsTrigger value="policies">Gestionar Políticas</TabsTrigger>
          </TabsList>
          <TabsContent value="all-requests">
            <AllRequests />
          </TabsContent>
          <TabsContent value="policies">
            <PolicyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;