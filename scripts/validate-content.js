#!/usr/bin/env node

/**
 * Build-time content validation script
 * This script validates all content files and can be run during the build process
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const isWatchMode = process.argv.includes('--watch');

// Validation schemas
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

// Validation functions
function validateContentFile(filePath, schema, contentType) {
  const errors = [];
  const warnings = [];

  try {
    if (!fs.existsSync(filePath)) {
      errors.push({
        file: filePath,
        message: `${contentType} file not found`,
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

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

    // Check content length for collections
    if (['project', 'publication', 'experience', 'education'].includes(contentType)) {
      if (!content || content.trim().length < 50) {
        warnings.push({
          file: filePath,
          message: `${contentType} content is very short (less than 50 characters). Consider adding more details.`
        });
      }
    }

    // Check image paths
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
      message: `Failed to parse file: ${error.message}`,
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateCollection(collectionName, schema) {
  const collectionPath = path.join(process.cwd(), 'src/content', collectionName);
  const allErrors = [];
  const allWarnings = [];

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
      message: `Failed to read collection directory: ${error.message}`,
      severity: 'error'
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

function validateAllContent() {
  const allErrors = [];
  const allWarnings = [];

  // Validate profile
  const profilePath = path.join(process.cwd(), 'src/content/profile/main.md');
  const profileResult = validateContentFile(profilePath, profileSchema, 'profile');
  allErrors.push(...profileResult.errors);
  allWarnings.push(...profileResult.warnings);

  // Validate skills
  const skillsPath = path.join(process.cwd(), 'src/content/skills/main.md');
  const skillsResult = validateContentFile(skillsPath, skillsSchema, 'skills');
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

function formatValidationResults(result) {
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

function getContentCounts() {
  const stats = {};
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

function printContentSummary() {
  const counts = getContentCounts();
  
  console.log('📊 Content Summary:');
  console.log('==================');
  Object.entries(counts).forEach(([type, count]) => {
    console.log(`${type.padEnd(12)}: ${count} files`);
  });
  console.log('');
}

async function runValidation() {
  console.log('🔍 Validating content files...\n');
  
  try {
    // Show content summary
    printContentSummary();
    
    const result = validateAllContent();
    const output = formatValidationResults(result);
    
    console.log(output);
    
    if (!result.isValid) {
      if (isWatchMode) {
        console.error('❌ Content validation failed. Fix the errors above and save to re-validate.');
        return false;
      } else {
        console.error('❌ Content validation failed. Please fix the errors above before building.');
        process.exit(1);
      }
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Content validation passed with warnings. Consider addressing the warnings above.');
    }
    
    console.log('✅ Content validation completed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Content validation script failed:', error.message);
    if (!isWatchMode) {
      process.exit(1);
    }
    return false;
  }
}

async function watchContent() {
  console.log('👀 Watching content files for changes...\n');
  
  const contentDir = path.join(process.cwd(), 'src/content');
  
  // Initial validation
  await runValidation();
  
  // Watch for changes
  fs.watch(contentDir, { recursive: true }, (_eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`\n📝 Content file changed: ${filename}`);
      setTimeout(() => runValidation(), 100); // Debounce
    }
  });
  
  console.log('\n👀 Watching for content changes... (Press Ctrl+C to stop)');
}

async function main() {
  if (isWatchMode) {
    await watchContent();
  } else {
    await runValidation();
  }
}

main();