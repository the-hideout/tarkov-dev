import { Logger } from '../utils/logger';
import axios from 'axios';

interface ToxicityResult {
  isToxic: boolean;
  confidence: number;
  categories: {
    [key: string]: number;
  };
}

export class AIService {
  private logger: Logger;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.logger = new Logger('ai');
    this.apiKey = process.env.PERSPECTIVE_API_KEY || '';
    this.baseUrl = 'https://commentanalyzer.googleapis.com/v1alpha1';
  }

  public async detectToxicity(message: string): Promise<ToxicityResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/comments:analyze?key=${this.apiKey}`,
        {
          comment: {
            text: message
          },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {}
          }
        }
      );

      const attributes = response.data.attributeScores;
      const categories: { [key: string]: number } = {};
      let maxScore = 0;

      for (const [key, value] of Object.entries(attributes)) {
        const score = (value as any).summaryScore.value;
        categories[key.toLowerCase()] = score;
        maxScore = Math.max(maxScore, score);
      }

      return {
        isToxic: maxScore >= 0.7,
        confidence: maxScore,
        categories
      };
    } catch (error) {
      this.logger.error('Failed to analyze message toxicity:', error);
      return {
        isToxic: false,
        confidence: 0,
        categories: {}
      };
    }
  }
} 