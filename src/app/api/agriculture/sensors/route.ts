import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock sensor data for testing
    const mockSensorData = [
      {
        id: "sensor_001",
        type: "Soil Moisture",
        value: 68,
        unit: "%",
        timestamp: new Date().toISOString(),
        status: "normal",
        location: "Field A - Zone 1"
      },
      {
        id: "sensor_002",
        type: "Temperature",
        value: 24.5,
        unit: "°C",
        timestamp: new Date().toISOString(),
        status: "normal",
        location: "Field A - Zone 1"
      },
      {
        id: "sensor_003",
        type: "pH Level",
        value: 6.8,
        unit: "",
        timestamp: new Date().toISOString(),
        status: "normal",
        location: "Field A - Zone 1"
      },
      {
        id: "sensor_004",
        type: "Light Intensity",
        value: 45000,
        unit: "lux",
        timestamp: new Date().toISOString(),
        status: "warning",
        location: "Field A - Zone 2"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockSensorData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate sensor data
    if (!body.sensorId || !body.value || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock storing sensor data (in real implementation, save to database)
    const sensorReading = {
      id: `reading_${Date.now()}`,
      sensorId: body.sensorId,
      type: body.type,
      value: body.value,
      unit: body.unit || '',
      timestamp: new Date().toISOString(),
      status: body.status || 'normal'
    };

    return NextResponse.json({
      success: true,
      data: sensorReading,
      message: 'Sensor reading stored successfully'
    });

  } catch (error) {
    console.error('Error storing sensor data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store sensor data' },
      { status: 500 }
    );
  }
}