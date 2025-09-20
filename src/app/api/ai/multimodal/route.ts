import { NextRequest, NextResponse } from 'next/server';
import { multiModalPipeline } from '@/lib/ai/multi-modal-pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.modalities || !Array.isArray(body.modalities) || body.modalities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one modality is required' },
        { status: 400 }
      );
    }

    // Create multi-modal input
    const input = {
      id: `mm_${Date.now()}`,
      modalities: body.modalities,
      context: body.context || {},
      processing: {
        priority: body.priority || 'medium',
        maxProcessingTime: body.maxProcessingTime || 30000,
        qualityLevel: body.qualityLevel || 'balanced',
        enableCaching: body.enableCaching !== false
      }
    };

    // Process through multi-modal pipeline
    const results = await multiModalPipeline.process(input);

    return NextResponse.json({
      success: true,
      data: {
        inputId: input.id,
        results,
        processingStats: multiModalPipeline.getStats()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing multi-modal input:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process multi-modal input' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return pipeline statistics and available modalities
    const stats = multiModalPipeline.getStats();

    const capabilities = {
      supportedModalities: ['text', 'code', 'image', 'audio', 'video'],
      availablePipelines: stats.pipelines,
      processingModes: ['parallel', 'sequential'],
      qualityLevels: ['fast', 'balanced', 'high_quality'],
      priorityLevels: ['low', 'medium', 'high', 'critical']
    };

    return NextResponse.json({
      success: true,
      data: {
        capabilities,
        stats,
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching pipeline info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline information' },
      { status: 500 }
    );
  }
}