/**
 * Content helper utilities for development and runtime use
 */

import { validateContentFile, validateCollection, type ValidationResult } from './contentValidation';
import path from 'path';

/**
 * Quick validation helpers for specific content types
 */
export class ContentValidator {

  /**
   * Validates a specific project file
   */
  static validateProject(filename: string): ValidationResult {
    const filePath = path.join(process.cwd(), 'src/content/projects', filename);
    const { projectSchema } = require('./contentValidation');
    return validateContentFile(filePath, projectSchema, 'project');
  }

  /**
   * Validates a specific publication file
   */
  static validatePublication(filename: string): ValidationResult {
    const filePath = path.join(process.cwd(), 'src/content/publications', filename);
    const { publicationSchema } = require('./contentValidation');
    return validateContentFile(filePath, publicationSchema, 'publication');
  }

  /**
   * Validates a specific experience file
   */
  static validateExperience(filename: string): ValidationResult {
    const filePath = path.join(process.cwd(), 'src/content/experience', filename);
    const { experienceSchema } = require('./contentValidation');
    return validateContentFile(filePath, experienceSchema, 'experience');
  }

  /**
   * Validates a specific education file
   */
  static validateEducation(filename: string): ValidationResult {
    const filePath = path.join(process.cwd(), 'src/content/education', filename);
    const { educationSchema } = require('./contentValidation');
    return validateContentFile(filePath, educationSchema, 'education');
  }

  /**
   * Validates all files in a specific collection
   */
  static validateCollectionByName(collectionName: 'projects' | 'publications' | 'experience' | 'education'): ValidationResult {
    const schemas = {
      projects: require('./contentValidation').projectSchema,
      publications: require('./contentValidation').publicationSchema,
      experience: require('./contentValidation').experienceSchema,
      education: require('./contentValidation').educationSchema,
    };

    return validateCollection(collectionName, schemas[collectionName]);
  }
}

/**
 * Content integrity checker - validates that all referenced assets exist
 */
export class ContentIntegrityChecker {

  /**
   * Checks if all referenced images exist in the public directory
   */
  static async checkImageReferences(): Promise<{ missing: string[], found: string[] }> {
    const fs = await import('fs');
    const path = await import('path');
    const matter = await import('gray-matter');

    const missing: string[] = [];
    const found: string[] = [];

    const contentDirs = ['projects', 'publications', 'experience', 'education'];

    // Check profile image
    try {
      const profilePath = path.join(process.cwd(), 'src/content/profile/main.md');
      const profileContent = fs.readFileSync(profilePath, 'utf-8');
      const { data } = matter.default(profileContent);

      if (data.profileImage) {
        const imagePath = path.join(process.cwd(), 'public', data.profileImage);
        if (fs.existsSync(imagePath)) {
          found.push(data.profileImage);
        } else {
          missing.push(data.profileImage);
        }
      }
    } catch (error) {
      // Profile file doesn't exist or can't be read
    }

    // Check collection images
    for (const dir of contentDirs) {
      const dirPath = path.join(process.cwd(), 'src/content', dir);

      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter.default(fileContent);

          // Check image field
          if (data.image) {
            const imagePath = path.join(process.cwd(), 'public', data.image);
            if (fs.existsSync(imagePath)) {
              found.push(data.image);
            } else {
              missing.push(data.image);
            }
          }

          // Check logo field
          if (data.logo) {
            const logoPath = path.join(process.cwd(), 'public', data.logo);
            if (fs.existsSync(logoPath)) {
              found.push(data.logo);
            } else {
              missing.push(data.logo);
            }
          }
        } catch (error) {
          // Skip files that can't be parsed
        }
      }
    }

    return { missing: [...new Set(missing)], found: [...new Set(found)] };
  }

  /**
   * Validates that all external URLs are accessible (basic check)
   */
  static async checkExternalLinks(): Promise<{ valid: string[], invalid: string[], unchecked: string[] }> {
    const fs = await import('fs');
    const path = await import('path');
    const matter = await import('gray-matter');

    const valid: string[] = [];
    const invalid: string[] = [];
    const unchecked: string[] = [];

    const contentDirs = ['projects', 'publications', 'experience', 'education'];
    const urlFields = ['github', 'demo', 'url', 'website'];

    for (const dir of contentDirs) {
      const dirPath = path.join(process.cwd(), 'src/content', dir);

      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter.default(fileContent);

          for (const field of urlFields) {
            if (data[field] && typeof data[field] === 'string') {
              try {
                new URL(data[field]); // Basic URL validation
                unchecked.push(data[field]); // We're not actually making HTTP requests in this basic version
              } catch {
                invalid.push(data[field]);
              }
            }
          }
        } catch (error) {
          // Skip files that can't be parsed
        }
      }
    }

    return { valid, invalid, unchecked: [...new Set(unchecked)] };
  }
}

/**
 * Development helper for quick content validation
 */
export function quickValidate(type?: 'all' | 'projects' | 'publications' | 'experience' | 'education'): void {
  const { validateAllContent, formatValidationResults } = require('./contentValidation');

  let result;

  if (!type || type === 'all') {
    result = validateAllContent();
  } else {
    result = ContentValidator.validateCollectionByName(type);
  }

  console.log(formatValidationResults(result));
}

/**
 * Project-specific content helpers
 */
export class ProjectHelpers {

  /**
   * Gets featured projects with validation
   */
  static async getFeaturedProjects(): Promise<any[]> {
    const fs = await import('fs');
    const path = await import('path');
    const matter = await import('gray-matter');

    const projectsDir = path.join(process.cwd(), 'src/content/projects');
    const projects: any[] = [];

    if (!fs.existsSync(projectsDir)) {
      console.warn('Projects directory not found');
      return [];
    }

    const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      try {
        const filePath = path.join(projectsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter.default(fileContent);

        if (data.featured) {
          projects.push({
            ...data,
            slug: file.replace('.md', ''),
            _file: file
          });
        }
      } catch (error) {
        console.warn(`Error parsing project file ${file}:`, error);
      }
    }

    return projects.sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  /**
   * Validates project data structure
   */
  static validateProjectData(project: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!project.title?.trim()) {
      errors.push('Title is required');
    }

    if (!project.description?.trim()) {
      errors.push('Description is required');
    }

    if (!Array.isArray(project.tags)) {
      errors.push('Tags must be an array');
    }

    if (project.github && !this.isValidUrl(project.github)) {
      errors.push('Invalid GitHub URL');
    }

    if (project.demo && !this.isValidUrl(project.demo)) {
      errors.push('Invalid demo URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets unique technologies from all projects
   */
  static async getProjectTechnologies(): Promise<string[]> {
    const projects = await this.getFeaturedProjects();
    const technologies = new Set<string>();

    projects.forEach(project => {
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag: string) => technologies.add(tag));
      }
    });

    return Array.from(technologies).sort();
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Experience-specific content helpers
 */
export class ExperienceHelpers {

  /**
   * Generates company initials for logo fallback
   */
  static getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Validates experience data structure
   */
  static validateExperienceData(experience: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!experience.company?.trim()) {
      errors.push('Company name is required');
    }

    if (!experience.position?.trim()) {
      errors.push('Position is required');
    }

    if (!experience.startDate?.trim()) {
      errors.push('Start date is required');
    }

    if (!experience.location?.trim()) {
      errors.push('Location is required');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}$/;
    if (experience.startDate && !dateRegex.test(experience.startDate)) {
      errors.push('Start date must be in YYYY-MM format');
    }

    if (experience.endDate && experience.endDate !== 'present' && !dateRegex.test(experience.endDate)) {
      errors.push('End date must be in YYYY-MM format or "present"');
    }

    if (experience.achievements && !Array.isArray(experience.achievements)) {
      errors.push('Achievements must be an array');
    }

    if (experience.technologies && !Array.isArray(experience.technologies)) {
      errors.push('Technologies must be an array');
    }

    if (experience.website && !this.isValidUrl(experience.website)) {
      errors.push('Invalid website URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets all unique technologies from experience entries
   */
  static async getExperienceTechnologies(): Promise<string[]> {
    const fs = await import('fs');
    const path = await import('path');
    const matter = await import('gray-matter');

    const technologies = new Set<string>();
    const experienceDir = path.join(process.cwd(), 'src/content/experience');

    if (!fs.existsSync(experienceDir)) {
      return [];
    }

    const files = fs.readdirSync(experienceDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      try {
        const filePath = path.join(experienceDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter.default(fileContent);

        if (Array.isArray(data.technologies)) {
          data.technologies.forEach((tech: string) => technologies.add(tech));
        }
      } catch (error) {
        console.warn(`Error parsing experience file ${file}:`, error);
      }
    }

    return Array.from(technologies).sort();
  }

  /**
   * Checks if a company logo file exists
   */
  static async checkCompanyLogo(logoPath: string): Promise<boolean> {
    const fs = await import('fs');
    const path = await import('path');

    if (!logoPath) return false;

    const fullPath = path.join(process.cwd(), 'public', logoPath);
    return fs.existsSync(fullPath);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Content statistics helper
 */
export class ContentStats {

  static async getContentCounts(): Promise<Record<string, number>> {
    const fs = await import('fs');
    const path = await import('path');

    const stats: Record<string, number> = {};
    const contentDirs = ['projects', 'publications', 'experience', 'education'];

    for (const dir of contentDirs) {
      const dirPath = path.join(process.cwd(), 'src/content', dir);

      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
        stats[dir] = files.length;
      } else {
        stats[dir] = 0;
      }
    }

    return stats;
  }

  static async getProjectStats(): Promise<{
    total: number;
    featured: number;
    withGithub: number;
    withDemo: number;
    technologies: number;
  }> {
    const projects = await ProjectHelpers.getFeaturedProjects();
    const technologies = await ProjectHelpers.getProjectTechnologies();

    return {
      total: projects.length,
      featured: projects.filter(p => p.featured).length,
      withGithub: projects.filter(p => p.github).length,
      withDemo: projects.filter(p => p.demo).length,
      technologies: technologies.length
    };
  }

  static async printContentSummary(): Promise<void> {
    const counts = await this.getContentCounts();
    const projectStats = await this.getProjectStats();

    console.log('\n📊 Content Summary:');
    console.log('==================');
    Object.entries(counts).forEach(([type, count]) => {
      console.log(`${type.padEnd(12)}: ${count} files`);
    });

    console.log('\n🚀 Project Details:');
    console.log('==================');
    console.log(`Featured     : ${projectStats.featured}`);
    console.log(`With GitHub  : ${projectStats.withGithub}`);
    console.log(`With Demo    : ${projectStats.withDemo}`);
    console.log(`Technologies : ${projectStats.technologies}`);
    console.log('');
  }
}