import axios from 'axios';
import Department from '../models/Department.model.js';

/**
 * AI Service for complaint processing
 * Uses OpenAI API or similar AI service
 */

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Auto-categorize complaint based on description
   */
  async categorizeComplaint(title, description) {
    if (!this.apiKey) {
      console.warn('AI API key not configured, using default category');
      return 'other';
    }

    try {
      const prompt = `Analyze the following complaint and categorize it into one of these categories:
- infrastructure (roads, bridges, buildings)
- sanitation (public toilets, cleanliness)
- water_supply (water quality, supply issues)
- electricity (power outages, electrical issues)
- traffic (traffic lights, road signs, congestion)
- waste_management (garbage collection, recycling)
- parks (parks, playgrounds, green spaces)
- security (safety, security issues)
- other (anything else)

Complaint Title: ${title}
Complaint Description: ${description}

Respond with ONLY the category name (e.g., "infrastructure"):`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a complaint categorization assistant. Respond with only the category name.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 20,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const category = response.data.choices[0].message.content.trim().toLowerCase();
      const validCategories = [
        'infrastructure', 'sanitation', 'water_supply', 'electricity',
        'traffic', 'waste_management', 'parks', 'security', 'other'
      ];

      return validCategories.includes(category) ? category : 'other';
    } catch (error) {
      console.error('AI categorization error:', error.message);
      return 'other';
    }
  }

  /**
   * Auto-assign priority based on description
   */
  async assignPriority(title, description) {
    if (!this.apiKey) {
      return 'medium';
    }

    try {
      const prompt = `Analyze the following complaint and assign a priority:
- high (urgent, safety issues, critical infrastructure)
- medium (important but not urgent)
- low (minor issues, non-critical)

Complaint Title: ${title}
Complaint Description: ${description}

Respond with ONLY the priority level (high, medium, or low):`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a priority assignment assistant. Respond with only: high, medium, or low.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 10,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const priority = response.data.choices[0].message.content.trim().toLowerCase();
      return ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';
    } catch (error) {
      console.error('AI priority assignment error:', error.message);
      return 'medium';
    }
  }

  /**
   * Auto-route complaint to appropriate department
   */
  async routeToDepartment(category) {
    try {
      // Find department by category
      const department = await Department.findOne({
        category: category,
        isActive: true
      });

      return department ? department._id : null;
    } catch (error) {
      console.error('Department routing error:', error.message);
      return null;
    }
  }

  /**
   * Generate resolution summary
   */
  async generateResolutionSummary(complaintTitle, complaintDescription, resolutionDetails) {
    if (!this.apiKey) {
      return resolutionDetails || 'Complaint resolved successfully.';
    }

    try {
      const prompt = `Generate a professional resolution summary for this complaint:

Original Complaint:
Title: ${complaintTitle}
Description: ${complaintDescription}

Resolution Details: ${resolutionDetails || 'Complaint has been resolved.'}

Generate a concise, professional summary (2-3 sentences) of how this complaint was resolved:`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a professional complaint resolution assistant. Generate concise resolution summaries.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI resolution summary error:', error.message);
      return resolutionDetails || 'Complaint resolved successfully.';
    }
  }

  /**
   * Process complaint with AI (categorize, prioritize, route)
   */
  async processComplaint(title, description) {
    try {
      const [category, priority] = await Promise.all([
        this.categorizeComplaint(title, description),
        this.assignPriority(title, description)
      ]);

      const departmentId = await this.routeToDepartment(category);

      return {
        category,
        priority,
        departmentId
      };
    } catch (error) {
      console.error('AI processing error:', error.message);
      return {
        category: 'other',
        priority: 'medium',
        departmentId: null
      };
    }
  }
}

export default new AIService();





