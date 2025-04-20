import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DefectList } from "@/components/defects/defect-list";

export default function DefectsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <DefectList />
        </main>
      </div>
    </div>
  );
}
