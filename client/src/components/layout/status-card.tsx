import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    positive?: boolean;
  };
  indicator?: string;
  timeFrame?: string;
  linkText?: string;
  linkHref?: string;
  icon?: ReactNode;
}

export function StatusCard({
  title,
  value,
  change,
  indicator,
  timeFrame = "Last 24h",
  linkText,
  linkHref,
  icon
}: StatusCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">{title}</h3>
          <span className="text-xs bg-primary/10 text-primary py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-full">
            {timeFrame}
          </span>
        </div>
        
        <div className="flex items-end">
          <span className="text-2xl sm:text-3xl font-semibold">{value}</span>
          
          {change && (
            <span className={`ml-2 text-xs font-medium flex items-center ${change.positive ? 'text-secondary' : 'text-destructive'}`}>
              {change.positive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change.value)}%
            </span>
          )}
        </div>
        
        {(indicator || linkText) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap justify-between items-center text-xs text-gray-500">
            {indicator && <span className="mb-1 sm:mb-0">{indicator}</span>}
            
            {linkText && linkHref && (
              <Link href={linkHref}>
                <span className="text-primary hover:underline cursor-pointer">{linkText}</span>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SystemHealthCardProps {
  percentage: number;
  status: "good" | "warning" | "critical";
}

export function SystemHealthCard({ percentage, status }: SystemHealthCardProps) {
  const getStatusColors = () => {
    switch (status) {
      case "good":
        return {
          text: "text-secondary",
          bg: "bg-secondary/10",
          barColor: "bg-secondary"
        };
      case "warning":
        return {
          text: "text-yellow-500",
          bg: "bg-yellow-50",
          barColor: "bg-yellow-500"
        };
      case "critical":
        return {
          text: "text-destructive",
          bg: "bg-destructive/10",
          barColor: "bg-destructive"
        };
    }
  };
  
  const colors = getStatusColors();
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">System Health</h3>
          <span className={`text-xs ${colors.bg} ${colors.text} py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-full capitalize`}>
            {statusText}
          </span>
        </div>
        
        <div className="flex items-end">
          <span className="text-2xl sm:text-3xl font-semibold">{percentage}%</span>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${colors.barColor} h-2 rounded-full`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
