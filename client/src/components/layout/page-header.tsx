import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-textColor">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      {children && (
        <div className="mt-4 md:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_24h">Last 24 hours</SelectItem>
        <SelectItem value="last_7d">Last 7 days</SelectItem>
        <SelectItem value="last_30d">Last 30 days</SelectItem>
        <SelectItem value="custom">Custom range</SelectItem>
      </SelectContent>
    </Select>
  );
}
