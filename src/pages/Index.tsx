import { Auth } from "@/components/Auth";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Mi Aplicación</h1>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <Auth />
        </div>
      </main>
      <footer className="p-4">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;