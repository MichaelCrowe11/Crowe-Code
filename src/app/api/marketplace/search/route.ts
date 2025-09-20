import { NextRequest, NextResponse } from 'next/server';
import { croweCodeMarketplace } from '@/lib/marketplace/marketplace-manager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, options = {} } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Search marketplace with provided options
    const results = await croweCodeMarketplace.searchMarketplace(query, {
      category: options.category,
      sortBy: options.sortBy || 'relevance',
      includeVSCode: options.includeVSCode !== false,
      includeCroweCode: options.includeCroweCode !== false,
      securityVerifiedOnly: options.securityVerifiedOnly || false,
      pricingFilter: options.pricingFilter || 'all'
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      extensions: results
    });

  } catch (error) {
    console.error('Marketplace search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search marketplace',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') as any;
    const sortBy = searchParams.get('sort') as any;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }

    const results = await croweCodeMarketplace.searchMarketplace(query, {
      category,
      sortBy: sortBy || 'relevance'
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      extensions: results
    });

  } catch (error) {
    console.error('Marketplace search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search marketplace',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}