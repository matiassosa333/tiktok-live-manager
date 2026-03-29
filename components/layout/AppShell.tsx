import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 md:grid-cols-[240px_1fr]">
        <div className="md:h-full">
          <Sidebar />
        </div>

        <div className="flex flex-col gap-4">
          <Topbar title={title} description={description} />
          {children}
        </div>
      </div>
    </main>
  );
}