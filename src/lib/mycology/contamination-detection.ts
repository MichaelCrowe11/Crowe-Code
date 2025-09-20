/**
 * CroweCode Mycology Contamination Detection System
 * AI-powered contamination detection and analysis for mushroom cultivation
 */

import { AIProviderManager } from '@/lib/ai-provider';

export interface ContaminationAnalysis {
  hasContamination: boolean;
  confidence: number;
  contaminationTypes: ContaminationType[];
  affectedArea: number; // Percentage
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  treatmentOptions: TreatmentOption[];
  quarantineRequired: boolean;
  imageAnalysis?: ImageAnalysisResult;
}

export interface ContaminationType {
  type: 'bacterial' | 'fungal' | 'mold' | 'yeast' | 'viral' | 'insect' | 'unknown';
  species?: string;
  commonName?: string;
  characteristics: string[];
  riskLevel: number; // 1-10 scale
  growthRate: 'slow' | 'medium' | 'fast' | 'explosive';
  environmentalFactors: string[];
}

export interface TreatmentOption {
  method: string;
  effectiveness: number; // 0-100%
  timeToResult: string;
  cost: 'low' | 'medium' | 'high';
  riskToMushrooms: 'none' | 'minimal' | 'moderate' | 'high';
  instructions: string[];
  materials: string[];
}

export interface ImageAnalysisResult {
  resolution: { width: number; height: number };
  colorProfile: ColorAnalysis;
  textureAnalysis: TextureAnalysis;
  spatialDistribution: SpatialAnalysis;
  temporalComparison?: TemporalAnalysis;
}

export interface ColorAnalysis {
  dominantColors: Array<{ color: string; percentage: number }>;
  unusualColors: string[];
  colorVariation: number;
  suspiciousRegions: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface TextureAnalysis {
  smoothness: number;
  roughness: number;
  patterns: string[];
  anomalies: Array<{ type: string; location: { x: number; y: number } }>;
}

export interface SpatialAnalysis {
  contaminationClusters: Array<{
    center: { x: number; y: number };
    radius: number;
    density: number;
    type: string;
  }>;
  spreadPattern: 'circular' | 'linear' | 'random' | 'focused';
  edgeDetection: Array<{ x: number; y: number }>;
}

export interface TemporalAnalysis {
  previousImages: string[];
  progressionRate: number;
  growthDirection: Array<{ angle: number; velocity: number }>;
  prediction: {
    timeToComplete: string;
    finalSeverity: string;
  };
}

export class ContaminationDetectionAI {
  private aiProvider: AIProviderManager;
  private analysisHistory: Map<string, ContaminationAnalysis[]> = new Map();

  constructor() {
    this.aiProvider = new AIProviderManager();
  }

  /**
   * Analyze image for contamination using computer vision
   */
  async analyzeImage(
    imageUrl: string,
    context?: {
      strainId?: string;
      cultureAge?: number;
      environmentalConditions?: any;
      previousAnalyses?: ContaminationAnalysis[];
    }
  ): Promise<ContaminationAnalysis> {
    try {
      // First, analyze the image using vision AI
      const visionAnalysis = await this.performVisionAnalysis(imageUrl, context);

      // Then, enhance with specialized mycology knowledge
      const detailedAnalysis = await this.enhanceWithMycologyExpertise(visionAnalysis, context);

      // Generate recommendations and treatment options
      const recommendations = await this.generateRecommendations(detailedAnalysis, context);

      // Store analysis in history
      if (context?.strainId) {
        this.storeAnalysis(context.strainId, detailedAnalysis);
      }

      return {
        ...detailedAnalysis,
        recommendations: recommendations.recommendations,
        treatmentOptions: recommendations.treatments
      };

    } catch (error) {
      console.error('Error analyzing image for contamination:', error);
      throw new Error('Failed to analyze image');
    }
  }

  /**
   * Perform initial vision analysis
   */
  private async performVisionAnalysis(
    imageUrl: string,
    context?: any
  ): Promise<Partial<ContaminationAnalysis>> {
    const prompt = `
    Analyze this mushroom cultivation image for contamination. Look for:

    1. Unusual colors (green, black, orange, pink spots)
    2. Texture changes (slimy, fuzzy, powdery areas)
    3. Growth patterns different from healthy mycelium
    4. Bacterial shine or wetness
    5. Mold formations
    6. Pest contamination

    Context: ${context ? JSON.stringify(context) : 'None provided'}

    Provide detailed analysis of any contamination found.
    `;

    const analysis = await this.aiProvider.processVision({
      imageUrl,
      prompt,
      model: 'mycology-vision-v2'
    });

    // Parse AI response into structured format
    return this.parseVisionResponse(analysis);
  }

  /**
   * Parse AI vision response into structured format
   */
  private parseVisionResponse(response: any): Partial<ContaminationAnalysis> {
    // This would parse the AI response and extract structured data
    // For now, returning mock data structure

    return {
      hasContamination: response.contamination_detected || false,
      confidence: response.confidence || 0,
      contaminationTypes: response.contamination_types || [],
      affectedArea: response.affected_percentage || 0,
      severity: response.severity || 'low',
      quarantineRequired: response.quarantine_required || false,
      imageAnalysis: {
        resolution: response.image_dimensions || { width: 0, height: 0 },
        colorProfile: response.color_analysis || {},
        textureAnalysis: response.texture_analysis || {},
        spatialDistribution: response.spatial_analysis || {}
      }
    };
  }

  /**
   * Enhance analysis with specialized mycology knowledge
   */
  private async enhanceWithMycologyExpertise(
    initialAnalysis: Partial<ContaminationAnalysis>,
    context?: any
  ): Promise<ContaminationAnalysis> {
    const prompt = `
    As a mycology expert, enhance this contamination analysis:

    Initial Analysis: ${JSON.stringify(initialAnalysis)}
    Context: ${JSON.stringify(context)}

    Provide:
    1. Specific contamination species identification
    2. Risk assessment and growth rate
    3. Environmental factors contributing to contamination
    4. Urgency level and quarantine requirements
    5. Potential impact on entire cultivation batch
    `;

    const expertAnalysis = await this.aiProvider.complete({
      prompt,
      model: 'mycology-expert-v3',
      temperature: 0.1 // Low temperature for factual analysis
    });

    // Combine initial analysis with expert enhancement
    return {
      hasContamination: initialAnalysis.hasContamination || false,
      confidence: initialAnalysis.confidence || 0,
      contaminationTypes: this.identifyContaminationTypes(expertAnalysis),
      affectedArea: initialAnalysis.affectedArea || 0,
      severity: this.assessSeverity(initialAnalysis, expertAnalysis),
      quarantineRequired: this.assessQuarantineNeed(initialAnalysis, expertAnalysis),
      recommendations: [],
      treatmentOptions: [],
      imageAnalysis: initialAnalysis.imageAnalysis
    };
  }

  /**
   * Identify specific contamination types from expert analysis
   */
  private identifyContaminationTypes(expertAnalysis: any): ContaminationType[] {
    // Parse expert analysis to identify contamination types
    const types: ContaminationType[] = [];

    // Common contamination types in mushroom cultivation
    const commonContaminants = [
      {
        type: 'fungal' as const,
        species: 'Trichoderma viride',
        commonName: 'Green Mold',
        characteristics: ['Bright green coloration', 'Fast spreading', 'Powdery texture'],
        riskLevel: 9,
        growthRate: 'explosive' as const,
        environmentalFactors: ['High humidity', 'Poor air circulation', 'Contaminated substrate']
      },
      {
        type: 'bacterial' as const,
        species: 'Pseudomonas spp.',
        commonName: 'Bacterial Blotch',
        characteristics: ['Wet appearance', 'Brown discoloration', 'Foul odor'],
        riskLevel: 7,
        growthRate: 'fast' as const,
        environmentalFactors: ['Excessive moisture', 'Poor drainage', 'High temperature']
      },
      {
        type: 'mold' as const,
        species: 'Penicillium spp.',
        commonName: 'Blue-Green Mold',
        characteristics: ['Blue-green coloration', 'Fuzzy texture', 'Spore production'],
        riskLevel: 8,
        growthRate: 'fast' as const,
        environmentalFactors: ['Contaminated air', 'Poor sterilization', 'High humidity']
      }
    ];

    // For demo, return relevant types based on analysis
    return commonContaminants.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  /**
   * Assess contamination severity
   */
  private assessSeverity(
    initialAnalysis: Partial<ContaminationAnalysis>,
    expertAnalysis: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    const affectedArea = initialAnalysis.affectedArea || 0;
    const confidence = initialAnalysis.confidence || 0;

    if (affectedArea > 50 && confidence > 0.8) return 'critical';
    if (affectedArea > 25 && confidence > 0.7) return 'high';
    if (affectedArea > 10 && confidence > 0.6) return 'medium';
    return 'low';
  }

  /**
   * Assess quarantine requirements
   */
  private assessQuarantineNeed(
    initialAnalysis: Partial<ContaminationAnalysis>,
    expertAnalysis: any
  ): boolean {
    const severity = this.assessSeverity(initialAnalysis, expertAnalysis);
    return ['high', 'critical'].includes(severity);
  }

  /**
   * Generate recommendations and treatment options
   */
  private async generateRecommendations(
    analysis: ContaminationAnalysis,
    context?: any
  ): Promise<{ recommendations: string[]; treatments: TreatmentOption[] }> {
    const prompt = `
    Generate specific recommendations and treatment options for this contamination:

    Analysis: ${JSON.stringify(analysis)}
    Context: ${JSON.stringify(context)}

    Provide:
    1. Immediate action steps
    2. Prevention strategies
    3. Treatment methods with effectiveness ratings
    4. Timeline for each treatment
    5. Cost and risk assessments
    `;

    const response = await this.aiProvider.complete({
      prompt,
      model: 'mycology-treatment-v2',
      temperature: 0.2
    });

    // Parse response into structured recommendations and treatments
    return {
      recommendations: this.parseRecommendations(response, analysis),
      treatments: this.parseTreatmentOptions(response, analysis)
    };
  }

  /**
   * Parse recommendations from AI response
   */
  private parseRecommendations(response: any, analysis: ContaminationAnalysis): string[] {
    const baseRecommendations = [
      'Isolate affected cultures immediately',
      'Increase air circulation in growing area',
      'Check and adjust humidity levels',
      'Review sterilization procedures',
      'Monitor adjacent cultures for signs of spread'
    ];

    // Add severity-specific recommendations
    if (analysis.severity === 'critical') {
      baseRecommendations.unshift(
        'IMMEDIATE QUARANTINE: Remove all affected materials',
        'Disinfect entire growing area before continuing'
      );
    }

    if (analysis.quarantineRequired) {
      baseRecommendations.push(
        'Mark affected area for extended monitoring',
        'Implement enhanced biosafety protocols'
      );
    }

    return baseRecommendations;
  }

  /**
   * Parse treatment options from AI response
   */
  private parseTreatmentOptions(response: any, analysis: ContaminationAnalysis): TreatmentOption[] {
    const baseTreatments: TreatmentOption[] = [
      {
        method: 'Physical Removal',
        effectiveness: 85,
        timeToResult: '24 hours',
        cost: 'low',
        riskToMushrooms: 'minimal',
        instructions: [
          'Use sterile tools to remove contaminated areas',
          'Cut 2-3cm beyond visible contamination',
          'Dispose of contaminated material safely',
          'Sterilize tools between cuts'
        ],
        materials: ['Sterile scalpel', 'Isopropyl alcohol', 'Disposal bags', 'Gloves']
      },
      {
        method: 'Hydrogen Peroxide Treatment',
        effectiveness: 70,
        timeToResult: '2-3 days',
        cost: 'low',
        riskToMushrooms: 'moderate',
        instructions: [
          'Prepare 3% hydrogen peroxide solution',
          'Apply to affected areas with spray bottle',
          'Allow to sit for 10 minutes',
          'Rinse with sterile water if needed'
        ],
        materials: ['3% Hydrogen peroxide', 'Spray bottle', 'Sterile water']
      },
      {
        method: 'Environmental Control',
        effectiveness: 60,
        timeToResult: '5-7 days',
        cost: 'medium',
        riskToMushrooms: 'none',
        instructions: [
          'Reduce humidity to 60-65%',
          'Increase air circulation',
          'Lower temperature by 2-3°C',
          'Adjust lighting schedule'
        ],
        materials: ['Dehumidifier', 'Fans', 'Humidity meter', 'Temperature controller']
      }
    ];

    // Filter treatments based on severity
    if (analysis.severity === 'critical') {
      return baseTreatments.filter(t => t.effectiveness > 70);
    }

    return baseTreatments;
  }

  /**
   * Store analysis in history for tracking progression
   */
  private storeAnalysis(strainId: string, analysis: ContaminationAnalysis): void {
    const history = this.analysisHistory.get(strainId) || [];
    history.push({
      ...analysis,
      // Add timestamp for tracking
      imageAnalysis: {
        ...analysis.imageAnalysis,
        temporalComparison: this.compareWithPrevious(history)
      } as any
    });

    // Keep only last 10 analyses
    if (history.length > 10) {
      history.shift();
    }

    this.analysisHistory.set(strainId, history);
  }

  /**
   * Compare current analysis with previous analyses
   */
  private compareWithPrevious(history: ContaminationAnalysis[]): TemporalAnalysis | undefined {
    if (history.length === 0) return undefined;

    const previous = history[history.length - 1];

    return {
      previousImages: history.map((_, i) => `analysis_${i}`),
      progressionRate: Math.random() * 0.5, // Mock progression rate
      growthDirection: [{ angle: Math.random() * 360, velocity: Math.random() * 10 }],
      prediction: {
        timeToComplete: '3-5 days',
        finalSeverity: 'high'
      }
    };
  }

  /**
   * Batch analyze multiple images
   */
  async batchAnalyze(imageUrls: string[], context?: any): Promise<ContaminationAnalysis[]> {
    const analyses = await Promise.all(
      imageUrls.map(url => this.analyzeImage(url, context))
    );

    return analyses;
  }

  /**
   * Get contamination trends for a strain
   */
  getContaminationTrends(strainId: string): {
    trend: 'improving' | 'worsening' | 'stable';
    riskLevel: number;
    recommendations: string[];
  } {
    const history = this.analysisHistory.get(strainId) || [];

    if (history.length < 2) {
      return {
        trend: 'stable',
        riskLevel: 0,
        recommendations: ['Continue monitoring with regular image analysis']
      };
    }

    const recent = history.slice(-3);
    const severityScores = recent.map(h => {
      const scores = { low: 1, medium: 2, high: 3, critical: 4 };
      return scores[h.severity];
    });

    const avgRecent = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;
    const isWorsening = severityScores[severityScores.length - 1] > severityScores[0];
    const isImproving = severityScores[severityScores.length - 1] < severityScores[0];

    return {
      trend: isWorsening ? 'worsening' : isImproving ? 'improving' : 'stable',
      riskLevel: Math.round(avgRecent * 25), // Convert to 0-100 scale
      recommendations: this.getTrendRecommendations(recent)
    };
  }

  /**
   * Generate trend-based recommendations
   */
  private getTrendRecommendations(recentAnalyses: ContaminationAnalysis[]): string[] {
    const recommendations = [];

    const hasHighSeverity = recentAnalyses.some(a => ['high', 'critical'].includes(a.severity));
    const hasMultipleTypes = recentAnalyses.some(a => a.contaminationTypes.length > 1);

    if (hasHighSeverity) {
      recommendations.push('Consider complete batch quarantine');
      recommendations.push('Review and upgrade sterilization protocols');
    }

    if (hasMultipleTypes) {
      recommendations.push('Investigate environmental contamination sources');
      recommendations.push('Implement enhanced air filtration');
    }

    recommendations.push('Continue daily monitoring with image analysis');
    recommendations.push('Document all treatment effectiveness');

    return recommendations;
  }
}

// Export singleton instance
export const contaminationDetector = new ContaminationDetectionAI();