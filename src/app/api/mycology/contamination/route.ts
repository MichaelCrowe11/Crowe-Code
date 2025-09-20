import { NextRequest, NextResponse } from 'next/server';
import { contaminationDetector } from '@/lib/mycology/contamination-detection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Perform contamination analysis
    const analysis = await contaminationDetector.analyzeImage(
      body.imageUrl,
      {
        strainId: body.strainId,
        cultureAge: body.cultureAge,
        environmentalConditions: body.environmentalConditions,
        previousAnalyses: body.previousAnalyses
      }
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing contamination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze contamination' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strainId = searchParams.get('strainId');

    if (!strainId) {
      return NextResponse.json(
        { success: false, error: 'Strain ID is required' },
        { status: 400 }
      );
    }

    // Get contamination trends for the strain
    const trends = contaminationDetector.getContaminationTrends(strainId);

    return NextResponse.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching contamination trends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contamination trends' },
      { status: 500 }
    );
  }
}