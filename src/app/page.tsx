/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, ArrowUpIcon, ArrowDownIcon, Gauge, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface TrafficData {
  time: string;
  lane1Flow: number;
  lane2Flow: number;
  lane1Speed: number;
  lane2Speed: number;
  totalFlow: number;
  avgSpeed: number;
}

interface PredictionData {
  timestamp: string;
  model: string;
  predicted_count: number;
  actual_count: number;
  time_for_pred: number;
  global_time: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// const RADIAN = Math.PI / 180;

// Custom Speedometer component
const Speedometer = ({ value, maxValue = 100 }: { value: number; maxValue?: number }) => {
  const percentage = (value / maxValue) * 360;
  
  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#eee"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#0088FE"
          strokeWidth="10"
          strokeDasharray={`${percentage}, 360`}
          style={{
            transformOrigin: '50% 50%',
            transform: 'rotate(-90deg)',
            transition: 'stroke-dasharray 0.5s ease-in-out'
          }}
        />
        <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-3xl">
          {value}
        </text>
      </svg>
    </div>
  );
};

// Custom animated counter
const AnimatedCounter = ({ value, title }: { value: number; title: string }) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="text-4xl font-bold"
        key={value}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {value}
      </motion.div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </motion.div>
  );
};

const RealTimeTrafficDashboard = () => {
  const [currentData, setCurrentData] = useState<TrafficData | null>(null);
  const [historicalData, setHistoricalData] = useState<TrafficData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrafficData = async () => {
    try {
      const response = await fetch('/api/traffic-data?type=realtime');
      if (!response.ok) {
        throw new Error('Failed to fetch traffic data');
      }
      const data = await response.json();

      const processedData = data.map((row: any) => ({
        time: new Date(row['5 Minutes']).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        lane1Flow: Number(row['Lane 1 Flow (Veh/5 Minutes)']),
        lane2Flow: Number(row['Lane 2 Flow (Veh/5 Minutes)']),
        lane1Speed: Number(row['Lane 1 Speed (mph)']),
        lane2Speed: Number(row['Lane 2 Speed (mph)']),
        totalFlow: Number(row['Flow (Veh/5 Minutes)']),
        avgSpeed: Number(row['Speed (mph)'])
      }));

      setHistoricalData(processedData);
      setCurrentData(processedData[processedData.length - 1]);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching traffic data:', err);
      setError('Failed to fetch traffic data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 5000);
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Activity className="w-6 h-6 text-primary animate-spin mr-2" />
        <span>Loading traffic data...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="p-4 bg-red-100 text-red-700 rounded-lg m-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertTriangle className="w-6 h-6 inline-block mr-2" />
        {error}
      </motion.div>
    );
  }

  if (!currentData) return null;

  const trafficDistribution = [
    { name: 'Lane 1', value: currentData.lane1Flow },
    { name: 'Lane 2', value: currentData.lane2Flow }
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Traffic Monitoring System</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-sm text-green-500">Live</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Current Speed</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Speedometer value={Math.round(currentData.avgSpeed)} maxValue={80} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Traffic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <AnimatedCounter value={currentData.totalFlow} title="Total Flow" />
                  <AnimatedCounter value={Math.round(currentData.avgSpeed)} title="Avg Speed" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Flow Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="lane1Flow" 
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Lane 1" 
                />
                <Area 
                  type="monotone" 
                  dataKey="lane2Flow"
                  stackId="1" 
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Lane 2" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speed Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="lane1Speed" name="Lane 1 Speed" fill="#8884d8" />
                <Bar dataKey="lane2Speed" name="Lane 2 Speed" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Flow Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalFlow" 
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
interface PredictionData {
  timestamp: string;
  predictedFlow: number;
  actualFlow: number;
  predictionTime: number;
  globalTime: number;
  error?: number;
}

interface Metrics {
  accuracy: number;
  mape: number;
  avgPredTime: number;
  errorRate: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}


const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="text-sm text-gray-600">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down';
  trendValue?: number;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, description }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
            {trend === 'up' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span className="ml-1">{trendValue}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </CardContent>
  </Card>
);

const COLORS2 = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PredictionDashboard = () => {
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchPredictionData = async () => {
    try {
      const response = await fetch('/api/traffic-data?type=prediction');
      if (!response.ok) throw new Error('Failed to fetch prediction data');
      
      const result = await response.json();
      const data = result.data || [];
      
      // Process data for time series visualization
      const processedData = data.map((item: { timestamp: string | number | Date; predictedFlow: number; actualFlow: number; }) => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        error: Math.abs(item.predictedFlow - item.actualFlow)
      }));

      setPredictionData(processedData);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Error fetching prediction data:', err);
      setError('Failed to fetch prediction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionData();
    const interval = setInterval(fetchPredictionData, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateMetrics = (): Metrics => {
    if (!predictionData.length) return { accuracy: 0, mape: 0, avgPredTime: 0, errorRate: 0 };
    
    const errors = predictionData.map(d => 
      Math.abs(d.predictedFlow - d.actualFlow) / d.actualFlow
    );
    const mape = (errors.reduce((sum, err) => sum + err, 0) / errors.length) * 100;
    const avgPredTime = predictionData.reduce((sum, d) => sum + d.predictionTime, 0) / predictionData.length;
    const errorRate = errors.reduce((sum, err) => sum + (err > 0.1 ? 1 : 0), 0) / errors.length * 100;
    
    return {
      accuracy: 100 - mape,
      mape,
      avgPredTime,
      errorRate
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Activity className="w-6 h-6 text-primary animate-spin mr-2" />
        <span>Loading prediction data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg m-4">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  const metrics = calculateMetrics();
  const latestPrediction = predictionData[predictionData.length - 1] || {};

  // Prepare data for radar chart
  const performanceMetrics = [
    { subject: 'Accuracy', A: metrics.accuracy, fullMark: 100 },
    { subject: 'Speed', A: 100 - (metrics.avgPredTime * 100), fullMark: 100 },
    { subject: 'Reliability', A: 100 - metrics.errorRate, fullMark: 100 },
    { subject: 'Precision', A: 100 - (metrics.mape / 2), fullMark: 100 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Traffic Prediction Analysis</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Prediction Accuracy"
          value={`${metrics.accuracy.toFixed(2)}%`}
          icon={Gauge}
          trend={metrics.accuracy > 90 ? 'down' : 'up'}
          trendValue={parseFloat((100 - metrics.accuracy).toFixed(1))}
          description="Based on MAPE calculation"
        />
        <StatCard
          title="Average Response Time"
          value={`${metrics.avgPredTime.toFixed(3)}s`}
          icon={Gauge}
          description="Mean prediction processing time"
        />
        <StatCard
          title="Latest Prediction"
          value={latestPrediction?.predictedFlow?.toFixed(2) || 'N/A'}
          icon={Gauge}
          trend={latestPrediction?.predictedFlow > latestPrediction?.actualFlow ? 'up' : 'down'}
          trendValue={parseFloat(((Math.abs(latestPrediction?.predictedFlow - latestPrediction?.actualFlow) / latestPrediction?.actualFlow) * 100).toFixed(1))} description={undefined}        />
        <StatCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(1)}%`}
          icon={Activity}
          trend={metrics.errorRate > 10 ? 'up' : 'down'}
          trendValue={parseFloat(((Math.abs(latestPrediction?.predictedFlow - latestPrediction?.actualFlow) / latestPrediction?.actualFlow) * 100).toFixed(1))} description={undefined}        />
      
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Prediction vs Actual Traffic Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{fontSize: 12}}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="predictedFlow"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicted"
                />
                <Area
                  type="monotone"
                  dataKey="actualFlow"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Error Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <BarChart data={predictionData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tick={{fontSize: 12}}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend />
                <Bar 
                  dataKey="error" 
                  fill="#8884d8" 
                  name="Prediction Error"
                >
                  {predictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <Tabs defaultValue="realtime" className="w-full">
        <div className="sticky top-0 bg-background z-10 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Traffic Analysis System</h1>
            <TabsList>
              <TabsTrigger value="realtime">Real-time Traffic</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="realtime" className="mt-4">
          <RealTimeTrafficDashboard />
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <PredictionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}