import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { RefreshCw } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm">
              <RefreshCw className="h-4 w-4" />
              <span className="font-medium">Synced</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
