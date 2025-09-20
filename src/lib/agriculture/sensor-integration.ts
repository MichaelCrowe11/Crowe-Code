/**
 * CroweCode Agriculture IoT Sensor Integration
 * Supports multiple sensor types and protocols for smart farming
 */

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';

export interface SensorConfig {
  id: string;
  type: SensorType;
  protocol: 'mqtt' | 'websocket' | 'http' | 'modbus' | 'zigbee';
  endpoint: string;
  farmId: string;
  fieldId?: string;
  calibration?: CalibrationData;
  thresholds?: ThresholdConfig;
  metadata?: Record<string, any>;
}

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'poor' | 'invalid';
  rawData?: any;
  processed?: ProcessedData;
}

export interface ProcessedData {
  normalizedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  anomaly: boolean;
  prediction?: {
    nextValue: number;
    confidence: number;
    timeframe: string;
  };
}

export interface CalibrationData {
  offset: number;
  scale: number;
  lastCalibrated: Date;
  calibrationCurve?: Array<{ input: number; output: number }>;
}

export interface ThresholdConfig {
  min: number;
  max: number;
  criticalMin: number;
  criticalMax: number;
  alertOnBreach: boolean;
}

export type SensorType =
  | 'soil_moisture'
  | 'soil_temperature'
  | 'soil_ph'
  | 'air_temperature'
  | 'air_humidity'
  | 'light_intensity'
  | 'uv_index'
  | 'wind_speed'
  | 'wind_direction'
  | 'rainfall'
  | 'atmospheric_pressure'
  | 'co2_level'
  | 'nutrient_level'
  | 'electrical_conductivity'
  | 'leaf_wetness'
  | 'stem_diameter'
  | 'plant_height';

export class AgricultureIoTHub extends EventEmitter {
  private sensors: Map<string, SensorConfig> = new Map();
  private connections: Map<string, any> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private isRunning: boolean = false;

  constructor(private redisClient?: any) {
    super();
    this.setupEventHandlers();
  }

  /**
   * Register a new sensor in the system
   */
  async registerSensor(config: SensorConfig): Promise<void> {
    this.sensors.set(config.id, config);

    // Initialize reading history
    this.readings.set(config.id, []);

    // Set up connection based on protocol
    await this.connectSensor(config);

    this.emit('sensorRegistered', config);
  }

  /**
   * Connect to a sensor based on its protocol
   */
  private async connectSensor(config: SensorConfig): Promise<void> {
    switch (config.protocol) {
      case 'websocket':
        await this.connectWebSocket(config);
        break;
      case 'mqtt':
        await this.connectMQTT(config);
        break;
      case 'http':
        await this.connectHTTP(config);
        break;
      case 'modbus':
        await this.connectModbus(config);
        break;
      case 'zigbee':
        await this.connectZigbee(config);
        break;
      default:
        throw new Error(`Unsupported protocol: ${config.protocol}`);
    }
  }

  /**
   * WebSocket sensor connection
   */
  private async connectWebSocket(config: SensorConfig): Promise<void> {
    const ws = new WebSocket(config.endpoint);

    ws.on('open', () => {
      console.log(`WebSocket sensor ${config.id} connected`);
      this.emit('sensorConnected', config.id);
    });

    ws.on('message', (data) => {
      try {
        const rawReading = JSON.parse(data.toString());
        this.processReading(config, rawReading);
      } catch (error) {
        console.error(`Error processing WebSocket data for sensor ${config.id}:`, error);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for sensor ${config.id}:`, error);
      this.emit('sensorError', config.id, error);
    });

    this.connections.set(config.id, ws);
  }

  /**
   * MQTT sensor connection
   */
  private async connectMQTT(config: SensorConfig): Promise<void> {
    // Implementation would use mqtt library
    console.log(`Connecting MQTT sensor ${config.id} to ${config.endpoint}`);

    // Mock connection for now
    const interval = setInterval(() => {
      this.simulateReading(config);
    }, 5000);

    this.connections.set(config.id, { type: 'mqtt', interval });
  }

  /**
   * HTTP polling sensor connection
   */
  private async connectHTTP(config: SensorConfig): Promise<void> {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(config.endpoint);
        const data = await response.json();
        this.processReading(config, data);
      } catch (error) {
        console.error(`HTTP polling error for sensor ${config.id}:`, error);
        this.emit('sensorError', config.id, error);
      }
    }, 10000); // Poll every 10 seconds

    this.connections.set(config.id, { type: 'http', interval: pollInterval });
  }

  /**
   * Modbus sensor connection
   */
  private async connectModbus(config: SensorConfig): Promise<void> {
    // Implementation would use modbus-serial library
    console.log(`Connecting Modbus sensor ${config.id} to ${config.endpoint}`);

    // Mock for now
    const interval = setInterval(() => {
      this.simulateReading(config);
    }, 15000);

    this.connections.set(config.id, { type: 'modbus', interval });
  }

  /**
   * Zigbee sensor connection
   */
  private async connectZigbee(config: SensorConfig): Promise<void> {
    // Implementation would use zigbee-herdsman library
    console.log(`Connecting Zigbee sensor ${config.id} to ${config.endpoint}`);

    // Mock for now
    const interval = setInterval(() => {
      this.simulateReading(config);
    }, 20000);

    this.connections.set(config.id, { type: 'zigbee', interval });
  }

  /**
   * Process incoming sensor reading
   */
  private async processReading(config: SensorConfig, rawData: any): Promise<void> {
    try {
      // Extract value from raw data
      const value = this.extractValue(config, rawData);

      // Apply calibration
      const calibratedValue = this.applyCalibration(config, value);

      // Create reading object
      const reading: SensorReading = {
        sensorId: config.id,
        timestamp: new Date(),
        value: calibratedValue,
        unit: this.getSensorUnit(config.type),
        quality: this.assessQuality(config, calibratedValue),
        rawData,
        processed: await this.processValue(config, calibratedValue)
      };

      // Store reading
      this.storeReading(reading);

      // Check thresholds and emit alerts
      this.checkThresholds(config, reading);

      // Emit reading event
      this.emit('reading', reading);

    } catch (error) {
      console.error(`Error processing reading for sensor ${config.id}:`, error);
      this.emit('processingError', config.id, error);
    }
  }

  /**
   * Extract numerical value from raw sensor data
   */
  private extractValue(config: SensorConfig, rawData: any): number {
    // Simple extraction - could be more sophisticated based on sensor type
    if (typeof rawData === 'number') return rawData;
    if (rawData.value !== undefined) return rawData.value;
    if (rawData.reading !== undefined) return rawData.reading;

    throw new Error('Unable to extract value from raw data');
  }

  /**
   * Apply calibration to raw sensor value
   */
  private applyCalibration(config: SensorConfig, value: number): number {
    if (!config.calibration) return value;

    const { offset, scale } = config.calibration;
    return (value * scale) + offset;
  }

  /**
   * Get the standard unit for a sensor type
   */
  private getSensorUnit(type: SensorType): string {
    const units: Record<SensorType, string> = {
      soil_moisture: '%',
      soil_temperature: '°C',
      soil_ph: 'pH',
      air_temperature: '°C',
      air_humidity: '%',
      light_intensity: 'lux',
      uv_index: 'UVI',
      wind_speed: 'm/s',
      wind_direction: '°',
      rainfall: 'mm',
      atmospheric_pressure: 'hPa',
      co2_level: 'ppm',
      nutrient_level: 'mg/L',
      electrical_conductivity: 'dS/m',
      leaf_wetness: '%',
      stem_diameter: 'mm',
      plant_height: 'cm'
    };

    return units[type] || 'units';
  }

  /**
   * Assess the quality of a sensor reading
   */
  private assessQuality(config: SensorConfig, value: number): 'good' | 'poor' | 'invalid' {
    if (!config.thresholds) return 'good';

    const { min, max } = config.thresholds;

    if (value < min || value > max) return 'invalid';

    // Additional quality checks could be added here
    return 'good';
  }

  /**
   * Process sensor value with AI/ML analysis
   */
  private async processValue(config: SensorConfig, value: number): Promise<ProcessedData> {
    const history = this.readings.get(config.id) || [];
    const recentValues = history.slice(-10).map(r => r.value);

    // Calculate trend
    const trend = this.calculateTrend(recentValues);

    // Detect anomalies
    const anomaly = this.detectAnomaly(value, recentValues);

    // Normalize value (0-1 scale based on typical ranges for sensor type)
    const normalizedValue = this.normalizeValue(config.type, value);

    return {
      normalizedValue,
      trend,
      anomaly,
      prediction: await this.predictNextValue(config, recentValues)
    };
  }

  /**
   * Calculate trend from recent values
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = values.slice(-6, -3);
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (avg > olderAvg * 1.05) return 'increasing';
    if (avg < olderAvg * 0.95) return 'decreasing';
    return 'stable';
  }

  /**
   * Detect anomalies using simple statistical method
   */
  private detectAnomaly(value: number, history: number[]): boolean {
    if (history.length < 5) return false;

    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // Value is anomalous if it's more than 2 standard deviations from mean
    return Math.abs(value - mean) > (2 * stdDev);
  }

  /**
   * Normalize sensor value based on typical ranges
   */
  private normalizeValue(type: SensorType, value: number): number {
    const ranges: Record<SensorType, { min: number; max: number }> = {
      soil_moisture: { min: 0, max: 100 },
      soil_temperature: { min: -10, max: 50 },
      soil_ph: { min: 4, max: 9 },
      air_temperature: { min: -20, max: 50 },
      air_humidity: { min: 0, max: 100 },
      light_intensity: { min: 0, max: 100000 },
      uv_index: { min: 0, max: 15 },
      wind_speed: { min: 0, max: 30 },
      wind_direction: { min: 0, max: 360 },
      rainfall: { min: 0, max: 50 },
      atmospheric_pressure: { min: 900, max: 1100 },
      co2_level: { min: 300, max: 2000 },
      nutrient_level: { min: 0, max: 500 },
      electrical_conductivity: { min: 0, max: 10 },
      leaf_wetness: { min: 0, max: 100 },
      stem_diameter: { min: 0, max: 100 },
      plant_height: { min: 0, max: 300 }
    };

    const range = ranges[type];
    return Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min)));
  }

  /**
   * Predict next sensor value using simple linear regression
   */
  private async predictNextValue(config: SensorConfig, history: number[]): Promise<any> {
    if (history.length < 3) return null;

    // Simple linear regression prediction
    const n = history.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = history;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextValue = slope * n + intercept;
    const confidence = Math.max(0.5, Math.min(0.95, 1 - Math.abs(slope) / 10));

    return {
      nextValue: Math.round(nextValue * 100) / 100,
      confidence: Math.round(confidence * 100),
      timeframe: '5 minutes'
    };
  }

  /**
   * Store sensor reading
   */
  private storeReading(reading: SensorReading): void {
    const history = this.readings.get(reading.sensorId) || [];

    // Keep only last 100 readings in memory
    history.push(reading);
    if (history.length > 100) {
      history.shift();
    }

    this.readings.set(reading.sensorId, history);

    // Store in Redis if available
    if (this.redisClient) {
      this.redisClient.zadd(
        `sensor:${reading.sensorId}:readings`,
        reading.timestamp.getTime(),
        JSON.stringify(reading)
      );
    }
  }

  /**
   * Check thresholds and emit alerts
   */
  private checkThresholds(config: SensorConfig, reading: SensorReading): void {
    if (!config.thresholds || !config.thresholds.alertOnBreach) return;

    const { min, max, criticalMin, criticalMax } = config.thresholds;
    const { value } = reading;

    if (value <= criticalMin || value >= criticalMax) {
      this.emit('criticalAlert', config, reading);
    } else if (value <= min || value >= max) {
      this.emit('warning', config, reading);
    }
  }

  /**
   * Simulate sensor reading for demo purposes
   */
  private simulateReading(config: SensorConfig): void {
    const baseValues: Record<SensorType, number> = {
      soil_moisture: 65,
      soil_temperature: 22,
      soil_ph: 6.8,
      air_temperature: 24,
      air_humidity: 70,
      light_intensity: 45000,
      uv_index: 6,
      wind_speed: 3.5,
      wind_direction: 180,
      rainfall: 0,
      atmospheric_pressure: 1013,
      co2_level: 400,
      nutrient_level: 150,
      electrical_conductivity: 2.5,
      leaf_wetness: 20,
      stem_diameter: 15,
      plant_height: 45
    };

    const baseValue = baseValues[config.type] || 50;
    const variance = baseValue * 0.1; // 10% variance
    const value = baseValue + (Math.random() - 0.5) * variance;

    this.processReading(config, { value, timestamp: new Date() });
  }

  /**
   * Get current readings for a sensor
   */
  getSensorReadings(sensorId: string, limit: number = 10): SensorReading[] {
    const history = this.readings.get(sensorId) || [];
    return history.slice(-limit);
  }

  /**
   * Get all registered sensors
   */
  getSensors(): SensorConfig[] {
    return Array.from(this.sensors.values());
  }

  /**
   * Start the IoT hub
   */
  start(): void {
    this.isRunning = true;
    this.emit('started');
  }

  /**
   * Stop the IoT hub
   */
  stop(): void {
    this.isRunning = false;

    // Close all connections
    for (const [sensorId, connection] of this.connections) {
      if (connection.close) {
        connection.close();
      } else if (connection.interval) {
        clearInterval(connection.interval);
      }
    }

    this.connections.clear();
    this.emit('stopped');
  }

  /**
   * Setup event handlers for logging and persistence
   */
  private setupEventHandlers(): void {
    this.on('reading', (reading: SensorReading) => {
      console.log(`Sensor ${reading.sensorId}: ${reading.value} ${reading.unit}`);
    });

    this.on('criticalAlert', (config: SensorConfig, reading: SensorReading) => {
      console.error(`CRITICAL ALERT: Sensor ${config.id} value ${reading.value} outside safe range`);
    });

    this.on('warning', (config: SensorConfig, reading: SensorReading) => {
      console.warn(`WARNING: Sensor ${config.id} value ${reading.value} outside normal range`);
    });
  }
}

// Export default instance
export const iotHub = new AgricultureIoTHub();