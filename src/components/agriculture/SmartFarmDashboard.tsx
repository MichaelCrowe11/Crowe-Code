"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Droplets,
  Sun,
  Wind,
  ThermometerSun,
  TrendingUp,
  AlertTriangle,
  Activity,
  Sprout,
  Cloud,
  Gauge,
  MapPin,
  Calendar,
  BarChart3
} from "lucide-react";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import FuturisticButton from "@/components/ui/FuturisticButton";
import HolographicDisplay from "@/components/ui/HolographicDisplay";
import QuantumLoader from "@/components/ui/QuantumLoader";

interface CropHealthData {
  overallHealth: number;
  growthStage: string;
  stressLevel: "low" | "medium" | "high";
  pestRisk: number;
  diseaseRisk: number;
  recommendations: string[];
}

interface YieldPrediction {
  expectedYield: number;
  confidence: number;
  harvestDate: string;
  factors: {
    weather: number;
    soil: number;
    irrigation: number;
    pestControl: number;
  };
}

interface SensorReading {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: "normal" | "warning" | "critical";
}

export default function SmartFarmDashboard() {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [cropHealth, setCropHealth] = useState<CropHealthData | null>(null);
  const [yieldPrediction, setYieldPrediction] = useState<YieldPrediction | null>(null);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sensors" | "analytics" | "ai-insights">("overview");

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching data
    setCropHealth({
      overallHealth: 87,
      growthStage: "Flowering",
      stressLevel: "low",
      pestRisk: 15,
      diseaseRisk: 8,
      recommendations: [
        "Increase irrigation by 15% for next 3 days",
        "Apply preventive fungicide within 48 hours",
        "Monitor soil nitrogen levels closely"
      ]
    });

    setYieldPrediction({
      expectedYield: 4.2,
      confidence: 92,
      harvestDate: "2025-03-15",
      factors: {
        weather: 85,
        soil: 90,
        irrigation: 78,
        pestControl: 88
      }
    });

    setSensorReadings([
      { id: "1", type: "Soil Moisture", value: 68, unit: "%", timestamp: new Date(), status: "normal" },
      { id: "2", type: "Temperature", value: 24.5, unit: "°C", timestamp: new Date(), status: "normal" },
      { id: "3", type: "pH Level", value: 6.8, unit: "", timestamp: new Date(), status: "normal" },
      { id: "4", type: "Light Intensity", value: 45000, unit: "lux", timestamp: new Date(), status: "warning" },
      { id: "5", type: "Humidity", value: 72, unit: "%", timestamp: new Date(), status: "normal" },
      { id: "6", type: "Wind Speed", value: 12, unit: "km/h", timestamp: new Date(), status: "normal" }
    ]);
  }, []);

  const analyzeCropHealth = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Update with new analysis results
    }, 3000);
  };

  const getSensorIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      "Soil Moisture": Droplets,
      "Temperature": ThermometerSun,
      "pH Level": Activity,
      "Light Intensity": Sun,
      "Humidity": Cloud,
      "Wind Speed": Wind
    };
    return icons[type] || Gauge;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-red-500";
      case "warning": return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-black to-emerald-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Smart Farm Dashboard
        </h1>
        <p className="text-gray-400">Real-time monitoring and AI-powered insights for optimal crop management</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        {["overview", "sensors", "analytics", "ai-insights"].map((tab) => (
          <FuturisticButton
            key={tab}
            variant={activeTab === tab ? "quantum" : "glass"}
            size="md"
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
          </FuturisticButton>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop Health Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassmorphicCard interactive gradient>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-400" />
                  Crop Health
                </h2>
                {cropHealth && (
                  <span className="text-2xl font-bold text-green-400">
                    {cropHealth.overallHealth}%
                  </span>
                )}
              </div>

              {cropHealth && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Growth Stage</span>
                    <span className="text-white font-medium">{cropHealth.growthStage}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stress Level</span>
                    <span className={`font-medium ${
                      cropHealth.stressLevel === "low" ? "text-green-400" :
                      cropHealth.stressLevel === "medium" ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {cropHealth.stressLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pest Risk</span>
                      <span className="text-white">{cropHealth.pestRisk}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${cropHealth.pestRisk}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Disease Risk</span>
                      <span className="text-white">{cropHealth.diseaseRisk}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${cropHealth.diseaseRisk}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <FuturisticButton
                variant="quantum"
                size="md"
                fullWidth
                onClick={analyzeCropHealth}
                loading={isAnalyzing}
                className="mt-4"
                icon={<Activity className="h-4 w-4" />}
              >
                {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
              </FuturisticButton>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Yield Prediction */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassmorphicCard interactive gradient>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Yield Forecast
                </h2>
                {yieldPrediction && (
                  <HolographicDisplay variant="badge" color="59, 130, 246" intensity={1}>
                    <span className="px-3 py-1 text-sm font-bold">
                      {yieldPrediction.confidence}% Confidence
                    </span>
                  </HolographicDisplay>
                )}
              </div>

              {yieldPrediction && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-white">
                      {yieldPrediction.expectedYield}
                    </div>
                    <div className="text-gray-400">tons per hectare</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Expected harvest: {new Date(yieldPrediction.harvestDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400">Contributing Factors</h3>
                    {Object.entries(yieldPrediction.factors).map(([factor, value]) => (
                      <div key={factor} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 capitalize">{factor}</span>
                          <span className="text-white">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Real-time Sensors */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassmorphicCard interactive gradient>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Gauge className="h-5 w-5 text-purple-400" />
                Live Sensors
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sensorReadings.map((sensor) => {
                  const Icon = getSensorIcon(sensor.type);
                  return (
                    <motion.div
                      key={sensor.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${getStatusColor(sensor.status)}`} />
                          <div>
                            <div className="text-sm text-gray-400">{sensor.type}</div>
                            <div className="text-lg font-semibold text-white">
                              {sensor.value}{sensor.unit}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs ${getStatusColor(sensor.status)}`}>
                          {sensor.status.toUpperCase()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      {cropHealth && cropHealth.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <GlassmorphicCard interactive gradient>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                AI Recommendations
              </h2>
              <div className="space-y-3">
                {cropHealth.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg"
                  >
                    <Sprout className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <p className="text-white text-sm">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}