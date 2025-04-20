import { useRealTime } from "@/hooks/use-real-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  ShieldAlert,
  Activity,
  Gauge,
  Thermometer,
  AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function StatusIndicators() {
  const { data, connected } = useRealTime();
  
  // Calculate statistics
  const criticalEvents = data.events.filter(e => e.priority === "critical").length;
  const totalEvents = data.events.length;
  const openDefects = data.defects.filter(d => d.status !== "closed" && d.status !== "resolved").length;
  const criticalDefects = data.defects.filter(d => d.severity === "critical").length;
  const totalDefects = data.defects.length;
  
  // Get latest forced signals
  const forcedSignals = data.signals.filter(s => s.category === "forced");
  const activeForcedSignals = forcedSignals.filter(s => s.status === "active");
  const criticalForcedSignals = forcedSignals.filter(s => s.severity === "critical");
  
  // Calculate system health percentage based on events and defects
  const calculateSystemHealth = () => {
    if (totalEvents === 0 && totalDefects === 0) return 100;
    
    // Weight factors
    const criticalEventWeight = 15;
    const normalEventWeight = 5;
    const criticalDefectWeight = 10;
    const normalDefectWeight = 3;
    
    // Calculate penalty points
    const criticalEventPenalty = criticalEvents * criticalEventWeight;
    const normalEventPenalty = (totalEvents - criticalEvents) * normalEventWeight;
    const criticalDefectPenalty = criticalDefects * criticalDefectWeight;
    const normalDefectPenalty = (totalDefects - criticalDefects) * normalDefectWeight;
    
    // Total possible penalty (cap at 100)
    const totalPenalty = criticalEventPenalty + normalEventPenalty + 
                         criticalDefectPenalty + normalDefectPenalty;
    
    // Health percentage
    return Math.max(0, 100 - totalPenalty);
  };
  
  const systemHealth = calculateSystemHealth();
  
  // Helper to get color based on value
  const getHealthColor = (health: number) => {
    if (health >= 85) return "text-green-500";
    if (health >= 70) return "text-yellow-500";
    if (health >= 50) return "text-orange-500";
    return "text-red-500";
  };
  
  const getProgressColor = (health: number) => {
    if (health >= 85) return "bg-green-500";
    if (health >= 70) return "bg-yellow-500";
    if (health >= 50) return "bg-orange-500";
    return "bg-red-500";
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Connection Status */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            Connection Status
            {connected ? (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-300">
                Disconnected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {connected ? (
              <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {connected 
                  ? "Real-time updates active" 
                  : "Connection lost, retrying..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 flex items-center">
            <Activity className={cn("h-7 w-7 mr-2", getHealthColor(systemHealth))} />
            <span className={getHealthColor(systemHealth)}>{systemHealth}%</span>
          </div>
          <Progress 
            value={systemHealth} 
            className={`h-2 ${getProgressColor(systemHealth)}`}
          />
        </CardContent>
      </Card>
      
      {/* Events Summary */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Events Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-sm font-medium">{totalEvents}</span>
                <span className="text-sm text-muted-foreground">Critical:</span>
                <span className="text-sm font-medium text-red-500">{criticalEvents}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Defects Summary */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Defects Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-orange-500 mr-2" />
            <div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm text-muted-foreground">Open:</span>
                <span className="text-sm font-medium">{openDefects}</span>
                <span className="text-sm text-muted-foreground">Critical:</span>
                <span className="text-sm font-medium text-red-500">{criticalDefects}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Forced Signals Indicators */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Forced Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-2" />
            <div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-sm font-medium">{forcedSignals.length}</span>
                <span className="text-sm text-muted-foreground">Active:</span>
                <span className="text-sm font-medium text-orange-500">{activeForcedSignals.length}</span>
                <span className="text-sm text-muted-foreground">Critical:</span>
                <span className="text-sm font-medium text-red-500">{criticalForcedSignals.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Forced Signal Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              {forcedSignals.length === 0 ? (
                <div className="text-sm text-muted-foreground">No forced signals active</div>
              ) : (
                <>
                  <div className="text-lg font-medium">
                    {criticalForcedSignals.length > 0 ? (
                      <span className="text-red-500">Critical signals detected</span>
                    ) : activeForcedSignals.length > 0 ? (
                      <span className="text-orange-500">Active forced signals</span>
                    ) : (
                      <span className="text-green-500">All signals normal</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {forcedSignals.length} signals being monitored
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Forced Signal Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center h-full">
            <Wrench className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <p className="text-sm">
                Forced signals are used to override normal process controls or sensor readings to prevent downtime due to small sensor issues or for testing purposes.
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  Active monitoring
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ShieldAlert className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <div className="text-lg font-medium">Normal</div>
              <div className="text-sm text-muted-foreground">All systems secure</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}