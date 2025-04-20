import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { EventList } from "@/components/events/event-list";

export default function EventsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-background">
          <EventList />
        </main>
      </div>
    </div>
  );
}
