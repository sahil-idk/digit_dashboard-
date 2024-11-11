export interface TrafficRecord {
    '5 Minutes': string;
    'Lane 1 Flow (Veh/5 Minutes)': number;
    'Lane 2 Flow (Veh/5 Minutes)': number;
    'Lane 1 Speed (mph)': number;
    'Lane 2 Speed (mph)': number;
    'Flow (Veh/5 Minutes)': number;
    'Speed (mph)': number;
    '# Lane Points': number;
    '% Observed': number;
  }
  
  export interface ProcessedTrafficData {
    timestamp: string;
    lane1_flow: number;
    lane2_flow: number;
    lane1_speed: number;
    lane2_speed: number;
    total_flow: number;
    avg_speed: number;
  }