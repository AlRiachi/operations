import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardView } from "@/components/dashboards/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <DashboardView />
        </main>
      </div>
    </div>
  );
}
