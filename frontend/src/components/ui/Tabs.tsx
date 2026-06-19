import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within a Tabs provider');
  return ctx;
}

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (tab: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  function setActiveTab(tab: string) {
    setActiveTabState(tab);
    onChange?.(tab);
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 border-b border-surface-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Tab({ value, children, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isActive
          ? 'border-b-2 border-primary-600 text-primary-600'
          : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50 rounded-t-lg',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('pt-4', className)}>
      {children}
    </div>
  );
}
