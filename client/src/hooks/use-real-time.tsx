import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Event, Defect, Signal } from "@shared/schema";

// Real-time update types
type RealTimeData = {
  events: Event[];
  defects: Defect[];
  signals: Signal[];
};

type RealTimeUpdate = {
  type: string;
  data: any;
};

type RealTimeContextType = {
  data: RealTimeData;
  connected: boolean;
};

const defaultRealTimeData: RealTimeData = {
  events: [],
  defects: [],
  signals: []
};

const RealTimeContext = createContext<RealTimeContextType>({
  data: defaultRealTimeData,
  connected: false
});

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<RealTimeData>(defaultRealTimeData);

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };
    
    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };
    
    newSocket.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data) as RealTimeUpdate;
        console.log("WebSocket message received:", update);
        
        // Handle different update types
        if (update.type === "initial_data") {
          setData(update.data as RealTimeData);
        } else if (update.type === "event_created") {
          setData(prevData => ({
            ...prevData,
            events: [...prevData.events, update.data]
          }));
        } else if (update.type === "event_updated") {
          setData(prevData => ({
            ...prevData,
            events: prevData.events.map(event => 
              event.id === update.data.id ? update.data : event
            )
          }));
        } else if (update.type === "event_deleted") {
          setData(prevData => ({
            ...prevData,
            events: prevData.events.filter(event => event.id !== update.data.id)
          }));
        } else if (update.type === "defect_created") {
          setData(prevData => ({
            ...prevData,
            defects: [...prevData.defects, update.data]
          }));
        } else if (update.type === "defect_updated") {
          setData(prevData => ({
            ...prevData,
            defects: prevData.defects.map(defect => 
              defect.id === update.data.id ? update.data : defect
            )
          }));
        } else if (update.type === "defect_deleted") {
          setData(prevData => ({
            ...prevData,
            defects: prevData.defects.filter(defect => defect.id !== update.data.id)
          }));
        } else if (update.type === "signal_created") {
          setData(prevData => ({
            ...prevData,
            signals: [...prevData.signals, update.data]
          }));
        } else if (update.type === "signal_updated") {
          setData(prevData => ({
            ...prevData,
            signals: prevData.signals.map(signal => 
              signal.id === update.data.id ? update.data : signal
            )
          }));
        } else if (update.type === "signal_deleted") {
          setData(prevData => ({
            ...prevData,
            signals: prevData.signals.filter(signal => signal.id !== update.data.id)
          }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);
  
  return (
    <RealTimeContext.Provider value={{ data, connected }}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
}