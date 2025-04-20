import { useRealTime } from "@/hooks/use-real-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Tool, 
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
  
  // Get latest signals for various systems
  const temperatureSignal = data.signals.find(s => s.name === "temperature");
  const pressureSignal = data.signals.find(s => s.name === "pressure");
  const powerOutputSignal = data.signals.find(s => s.name === "power_output");
  
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
            className="h-2"
            indicatorClassName={getProgressColor(systemHealth)}
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
            <Tool className="h-8 w-8 text-orange-500 mr-2" />
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
      
      {/* Signal Indicators */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Thermometer className="h-8 w-8 text-orange-500 mr-2" />
            <div>
              <div className="text-2xl font-bold">
                {temperatureSignal ? (
                  <>
                    {temperatureSignal.value}
                    <span className="text-sm text-muted-foreground ml-1">°C</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No data</span>
                )}
              </div>
              {temperatureSignal && temperatureSignal.status === "warning" && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Warning
                </Badge>
              )}
              {temperatureSignal && temperatureSignal.status === "critical" && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Critical
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Gauge className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <div className="text-2xl font-bold">
                {pressureSignal ? (
                  <>
                    {pressureSignal.value}
                    <span className="text-sm text-muted-foreground ml-1">bar</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No data</span>
                )}
              </div>
              {pressureSignal && pressureSignal.status === "warning" && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Warning
                </Badge>
              )}
              {pressureSignal && pressureSignal.status === "critical" && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Critical
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Power Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <div className="text-2xl font-bold">
                {powerOutputSignal ? (
                  <>
                    {powerOutputSignal.value}
                    <span className="text-sm text-muted-foreground ml-1">MW</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No data</span>
                )}
              </div>
              {powerOutputSignal && powerOutputSignal.status === "warning" && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Warning
                </Badge>
              )}
              {powerOutputSignal && powerOutputSignal.status === "critical" && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Critical
                </Badge>
              )}
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