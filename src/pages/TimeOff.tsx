import { RequestTimeOffModal } from "../components/time-off/RequestTimeOffModal";
import { TimeOffHistory } from "../components/time-off/TimeOffHistory";

const TimeOff = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Portal de Ausencias
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus solicitudes de tiempo libre.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <RequestTimeOffModal />
          </div>
        </header>

        <main>
          <TimeOffHistory />
        </main>
      </div>
    </div>
  );
};

export default TimeOff;