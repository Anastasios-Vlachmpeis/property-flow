import { Home, Building2, DollarSign, Users, Settings, ChevronRight } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Listings Manager', href: '/listings', icon: Building2 },
  { name: 'Pricing Intelligence', href: '/pricing', icon: DollarSign },
  { name: 'Guest Hub', href: '/guest-hub', icon: Users },
  {
    name: 'Operations',
    icon: Settings,
    children: [
      { name: 'Cleaning', href: '/operations/cleaning' },
      { name: 'Offboarding', href: '/operations/offboarding' },
    ],
  },
];

export function AppSidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Operations']);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary">PropManager</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Automation Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedItems.includes(item.name) && 'rotate-90'
                    )}
                  />
                </button>
                {expandedItems.includes(item.name) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        className="block px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.href}
                end
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
