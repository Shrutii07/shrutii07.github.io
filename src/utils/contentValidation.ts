import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Note: Schema types are available from content config if needed for type checking

// Define validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  file: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  file: string;
  field?: string;
  message: string;
}

// Content validation schemas (re-exported from config for validation)
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  email: z.string().email("Invalid email format"),
  location: z.string().min(1, "Location is required"),
  profileImage: z.string().min(1, "Profile image path is required"),
  social: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    scholar: z.string().optional(),
  }),
});

const skillsSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().min(1, "Category name is required"),
      skills: z.array(
        z.object({
          name: z.string().min(1, "Skill name is required"),
          level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
            errorMap: () => ({ message: "Level must be one of: Beginner, Intermediate, Advanced, Expert" })
          }),
          color: z.string().min(1, "Color is required"),
        })
      ).min(1, "Each category must have at least one skill"),
    })
  ).min(1, "At least one skill category is required"),
});

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  image: z.string().min(1, "Image path is required"),
  github: z.string().url("Invalid GitHub URL").optional(),
  demo: z.string().url("Invalid demo URL").optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const publicationSchema = z.object({
  title: z.string().min(1, "Publication title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  venue: z.string().min(1, "Venue is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 5, "Year must be reasonable"),
  url: z.string().url("Invalid URL").optional(),
  type: z.enum(['conference', 'journal', 'patent', 'preprint'], {
    errorMap: () => ({ message: "Type must be one of: conference, journal, patent, preprint" })
  }),
  doi: z.string().optional(),
  abstract: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  logo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  achievements: z.array(z.string()).min(1, "At least one achievement is required"),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  logo: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  coursework: z.array(z.string()).optional(),
  thesis: z.string().optional(),
});

/**
 * Validates a single content file against its schema
 */
export function validateContentFile(filePath: string, schema: z.ZodSchema, contentType: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push({
        file: filePath,
        message: `${contentType} file not found`,
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Validate frontmatter against schema
    const result = schema.safeParse(frontmatter);
    
    if (!result.success) {
      result.error.errors.forEach(error => {
        errors.push({
          file: filePath,
          field: error.path.join('.'),
          message: error.message,
          severity: 'error'
        });
      });
    }

    // Additional content-specific validations
    if (contentType === 'project' || contentType === 'publication' || contentType === 'experience' || contentType === 'education') {
      if (!content || content.trim().length < 50) {
        warnings.push({
          file: filePath,
          message: `${contentType} content is very short (less than 50 characters). Consider adding more details.`
        });
      }
    }

    // Validate image paths exist (if specified)
    if (frontmatter.image && typeof frontmatter.image === 'string') {
      const imagePath = path.join(process.cwd(), 'public', frontmatter.image);
      if (!fs.existsSync(imagePath)) {
        warnings.push({
          file: filePath,
          field: 'image',
          message: `Referenced image file not found: ${frontmatter.image}`
        });
      }
    }

    // Validate logo paths exist (if specified)
    if (frontmatter.logo && typeof frontmatter.logo === 'string') {
      const logoPath = path.join(process.cwd(), 'public', frontmatter.logo);
      if (!fs.existsSync(logoPath)) {
        warnings.push({
          file: filePath,
          field: 'logo',
          message: `Referenced logo file not found: ${frontmatter.logo}`
        });
      }
    }

  } catch (error) {
    errors.push({
      file: filePath,
      message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates profile content
 */
export function validateProfile(): ValidationResult {
  const profilePath = path.join(process.cwd(), 'src/content/profile/main.md');
  return validateContentFile(profilePath, profileSchema, 'profile');
}

/**
 * Validates skills content
 */
export function validateSkills(): ValidationResult {
  const skillsPath = path.join(process.cwd(), 'src/content/skills/main.md');
  return validateContentFile(skillsPath, skillsSchema, 'skills');
}

/**
 * Validates all content in a collection directory
 */
export function validateCollection(collectionName: string, schema: z.ZodSchema): ValidationResult {
  const collectionPath = path.join(process.cwd(), 'src/content', collectionName);
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  try {
    if (!fs.existsSync(collectionPath)) {
      allErrors.push({
        file: collectionPath,
        message: `Collection directory not found: ${collectionName}`,
        severity: 'error'
      });
      return { isValid: false, errors: allErrors, warnings: allWarnings };
    }

    const files = fs.readdirSync(collectionPath)
      .filter(file => file.endsWith('.md') && !file.startsWith('.'));

    if (files.length === 0) {
      allWarnings.push({
        file: collectionPath,
        message: `No content files found in ${collectionName} collection`
      });
    }

    files.forEach(file => {
      const filePath = path.join(collectionPath, file);
      const result = validateContentFile(filePath, schema, collectionName);
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });

  } catch (error) {
    allErrors.push({
      file: collectionPath,
      message: `Failed to read collection directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error'
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Validates all content across the entire site
 */
export function validateAllContent(): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  // Validate profile
  const profileResult = validateProfile();
  allErrors.push(...profileResult.errors);
  allWarnings.push(...profileResult.warnings);

  // Validate skills
  const skillsResult = validateSkills();
  allErrors.push(...skillsResult.errors);
  allWarnings.push(...skillsResult.warnings);

  // Validate collections
  const collections = [
    { name: 'projects', schema: projectSchema },
    { name: 'publications', schema: publicationSchema },
    { name: 'experience', schema: experienceSchema },
    { name: 'education', schema: educationSchema },
  ];

  collections.forEach(({ name, schema }) => {
    const result = validateCollection(name, schema);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Formats validation results for console output
 */
export function formatValidationResults(result: ValidationResult): string {
  let output = '';

  if (result.isValid && result.warnings.length === 0) {
    output += '✅ All content validation passed!\n';
    return output;
  }

  if (result.errors.length > 0) {
    output += `❌ Found ${result.errors.length} validation error(s):\n\n`;
    result.errors.forEach(error => {
      output += `  File: ${error.file}\n`;
      if (error.field) {
        output += `  Field: ${error.field}\n`;
      }
      output += `  Error: ${error.message}\n\n`;
    });
  }

  if (result.warnings.length > 0) {
    output += `⚠️  Found ${result.warnings.length} warning(s):\n\n`;
    result.warnings.forEach(warning => {
      output += `  File: ${warning.file}\n`;
      if (warning.field) {
        output += `  Field: ${warning.field}\n`;
      }
      output += `  Warning: ${warning.message}\n\n`;
    });
  }

  return output;
}

/**
 * Validates content and throws an error if validation fails
 * Useful for build-time validation
 */
export function validateContentOrThrow(): void {
  const result = validateAllContent();
  
  if (!result.isValid) {
    const errorMessage = formatValidationResults(result);
    throw new Error(`Content validation failed:\n${errorMessage}`);
  }

  // Log warnings even if validation passes
  if (result.warnings.length > 0) {
    console.warn(formatValidationResults(result));
  } else {
    console.log('✅ All content validation passed!');
  }
}

/**
 * Enhanced error handling for content validation
 */
export class ContentValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly warnings: ValidationWarning[];
  
  constructor(result: ValidationResult) {
    const message = formatValidationResults(result);
    super(`Content validation failed:\n${message}`);
    this.name = 'ContentValidationError';
    this.errors = result.errors;
    this.warnings = result.warnings;
  }
  
  /**
   * Get errors for a specific file
   */
  getErrorsForFile(filePath: string): ValidationError[] {
    return this.errors.filter(error => error.file.includes(filePath));
  }
  
  /**
   * Get warnings for a specific file
   */
  getWarningsForFile(filePath: string): ValidationWarning[] {
    return this.warnings.filter(warning => warning.file.includes(filePath));
  }
  
  /**
   * Check if there are errors for a specific field
   */
  hasFieldErrors(field: string): boolean {
    return this.errors.some(error => error.field === field);
  }
}

/**
 * Validates content and throws ContentValidationError if validation fails
 */
export function validateContentOrThrowDetailed(): void {
  const result = validateAllContent();
  
  if (!result.isValid) {
    throw new ContentValidationError(result);
  }

  // Log warnings even if validation passes
  if (result.warnings.length > 0) {
    console.warn(formatValidationResults(result));
  } else {
    console.log('✅ All content validation passed!');
  }
}
/**

 * Checks for missing required content files
 */
export function checkMissingContent(): {
  missing: string[];
  found: string[];
  recommendations: string[];
} {
  const fs = require('fs');
  const path = require('path');
  
  const missing: string[] = [];
  const found: string[] = [];
  const recommendations: string[] = [];
  
  // Required files
  const requiredFiles = [
    { path: 'src/content/profile/main.md', name: 'Profile' },
    { path: 'src/content/skills/main.md', name: 'Skills' }
  ];
  
  // Check required files
  requiredFiles.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      found.push(name);
    } else {
      missing.push(name);
      recommendations.push(`Create ${filePath} with your ${name.toLowerCase()} information`);
    }
  });
  
  // Check collections
  const collections = ['projects', 'publications', 'experience', 'education'];
  collections.forEach(collection => {
    const collectionPath = path.join(process.cwd(), 'src/content', collection);
    if (fs.existsSync(collectionPath)) {
      const files = fs.readdirSync(collectionPath).filter((file: string) => file.endsWith('.md'));
      if (files.length === 0) {
        missing.push(`${collection} content`);
        recommendations.push(`Add at least one ${collection.slice(0, -1)} file to src/content/${collection}/`);
      } else {
        found.push(`${collection} (${files.length} files)`);
      }
    } else {
      missing.push(`${collection} directory`);
      recommendations.push(`Create src/content/${collection}/ directory and add content files`);
    }
  });
  
  return { missing, found, recommendations };
}

/**
 * Validates content completeness and provides suggestions
 */
export function validateContentCompleteness(): {
  score: number;
  suggestions: string[];
  completedSections: string[];
  missingSections: string[];
} {
  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');
  
  const suggestions: string[] = [];
  const completedSections: string[] = [];
  const missingSections: string[] = [];
  let totalScore = 0;
  const maxScore = 100;
  
  // Check profile completeness (20 points)
  try {
    const profilePath = path.join(process.cwd(), 'src/content/profile/main.md');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');
    const { data, content } = matter(profileContent);
    
    let profileScore = 0;
    if (data.name && data.title && data.bio && data.email) profileScore += 10;
    if (data.profileImage) profileScore += 5;
    if (data.social && Object.keys(data.social).length > 0) profileScore += 3;
    if (content && content.length > 100) profileScore += 2;
    
    totalScore += profileScore;
    
    if (profileScore >= 15) {
      completedSections.push('Profile');
    } else {
      missingSections.push('Profile');
      if (!data.profileImage) suggestions.push('Add a profile image to make your portfolio more personal');
      if (!data.social || Object.keys(data.social).length === 0) suggestions.push('Add social media links to increase connectivity');
      if (!content || content.length < 100) suggestions.push('Expand your profile description with more details about yourself');
    }
  } catch {
    missingSections.push('Profile');
    suggestions.push('Create a complete profile with name, title, bio, email, and image');
  }
  
  // Check skills completeness (15 points)
  try {
    const skillsPath = path.join(process.cwd(), 'src/content/skills/main.md');
    const skillsContent = fs.readFileSync(skillsPath, 'utf-8');
    const { data } = matter(skillsContent);
    
    let skillsScore = 0;
    if (data.categories && data.categories.length >= 3) skillsScore += 10;
    if (data.categories && data.categories.some((cat: any) => cat.skills && cat.skills.length >= 3)) skillsScore += 5;
    
    totalScore += skillsScore;
    
    if (skillsScore >= 10) {
      completedSections.push('Skills');
    } else {
      missingSections.push('Skills');
      suggestions.push('Add at least 3 skill categories with multiple skills each');
    }
  } catch {
    missingSections.push('Skills');
    suggestions.push('Create a skills section with categorized technical skills');
  }
  
  // Check collections completeness
  const collections = [
    { name: 'projects', weight: 25, minFiles: 2 },
    { name: 'experience', weight: 20, minFiles: 1 },
    { name: 'publications', weight: 10, minFiles: 1 },
    { name: 'education', weight: 10, minFiles: 1 }
  ];
  
  collections.forEach(({ name, weight, minFiles }) => {
    const collectionPath = path.join(process.cwd(), 'src/content', name);
    let collectionScore = 0;
    
    if (fs.existsSync(collectionPath)) {
      const files = fs.readdirSync(collectionPath).filter((file: string) => file.endsWith('.md'));
      
      if (files.length >= minFiles) {
        collectionScore = weight;
        completedSections.push(name.charAt(0).toUpperCase() + name.slice(1));
      } else if (files.length > 0) {
        collectionScore = Math.floor(weight * 0.5);
        missingSections.push(name.charAt(0).toUpperCase() + name.slice(1));
        suggestions.push(`Add more ${name} - you have ${files.length} but ${minFiles} or more is recommended`);
      } else {
        missingSections.push(name.charAt(0).toUpperCase() + name.slice(1));
        suggestions.push(`Add ${name} to showcase your ${name === 'publications' ? 'research work' : 'professional background'}`);
      }
    } else {
      missingSections.push(name.charAt(0).toUpperCase() + name.slice(1));
      suggestions.push(`Create ${name} section to showcase your ${name === 'publications' ? 'research work' : 'professional background'}`);
    }
    
    totalScore += collectionScore;
  });
  
  const score = Math.round((totalScore / maxScore) * 100);
  
  return {
    score,
    suggestions,
    completedSections,
    missingSections
  };
}

/**
 * Generates a content validation report
 */
export function generateValidationReport(): string {
  const validationResult = validateAllContent();
  const missingContent = checkMissingContent();
  const completeness = validateContentCompleteness();
  
  let report = '# Content Validation Report\n\n';
  
  // Overall status
  if (validationResult.isValid) {
    report += '✅ **Status**: All content validation passed!\n\n';
  } else {
    report += '❌ **Status**: Content validation failed\n\n';
  }
  
  // Completeness score
  report += `📊 **Completeness Score**: ${completeness.score}%\n\n`;
  
  // Completed sections
  if (completeness.completedSections.length > 0) {
    report += '✅ **Completed Sections**:\n';
    completeness.completedSections.forEach(section => {
      report += `- ${section}\n`;
    });
    report += '\n';
  }
  
  // Missing sections
  if (completeness.missingSections.length > 0) {
    report += '⚠️ **Missing/Incomplete Sections**:\n';
    completeness.missingSections.forEach(section => {
      report += `- ${section}\n`;
    });
    report += '\n';
  }
  
  // Errors
  if (validationResult.errors.length > 0) {
    report += `❌ **Errors** (${validationResult.errors.length}):\n`;
    validationResult.errors.forEach(error => {
      report += `- **${error.file}**`;
      if (error.field) report += ` (${error.field})`;
      report += `: ${error.message}\n`;
    });
    report += '\n';
  }
  
  // Warnings
  if (validationResult.warnings.length > 0) {
    report += `⚠️ **Warnings** (${validationResult.warnings.length}):\n`;
    validationResult.warnings.forEach(warning => {
      report += `- **${warning.file}**`;
      if (warning.field) report += ` (${warning.field})`;
      report += `: ${warning.message}\n`;
    });
    report += '\n';
  }
  
  // Suggestions
  if (completeness.suggestions.length > 0) {
    report += '💡 **Suggestions for Improvement**:\n';
    completeness.suggestions.forEach(suggestion => {
      report += `- ${suggestion}\n`;
    });
    report += '\n';
  }
  
  // Missing content
  if (missingContent.missing.length > 0) {
    report += '📋 **Missing Content**:\n';
    missingContent.missing.forEach(item => {
      report += `- ${item}\n`;
    });
    report += '\n';
    
    report += '🔧 **Recommendations**:\n';
    missingContent.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
  }
  
  return report;
}