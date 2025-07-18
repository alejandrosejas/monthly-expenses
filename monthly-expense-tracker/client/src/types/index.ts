// Re-export types from shared package
export * from 'shared';

// App-specific types
export interface AppState {
  currentMonth: string;
}

// Component prop types
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export interface TabProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabProps[];
  value: string;
  onChange: (value: string) => void;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface SelectOption {
  value: string;
  label: string;
}