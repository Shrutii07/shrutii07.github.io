/**
 * CLI utility for content validation during development
 * Can be imported and used in development scripts or Astro components
 */

import { 
  validateAllContent, 
  validateProfile, 
  validateSkills, 
  validateCollection,
  formatValidationResults,
  type ValidationResult 
} from './contentValidation';
import { ContentStats, ContentIntegrityChecker } from './contentHelpers';

export interface ValidationOptions {
  verbose?: boolean;
  checkAssets?: boolean;
  checkLinks?: boolean;
  exitOnError?: boolean;
}

/**
 * Main validation function with options
 */
export async function validateContent(options: ValidationOptions = {}): Promise<ValidationResult> {
  const { verbose = false, checkAssets = false, checkLinks = false, exitOnError = false } = options;
  
  if (verbose) {
    console.log('🔍 Starting comprehensive content validation...\n');
    await ContentStats.printContentSummary();
  }
  
  // Core content validation
  const result = validateAllContent();
  
  if (verbose || !result.isValid || result.warnings.length > 0) {
    console.log(formatValidationResults(result));
  }
  
  // Asset integrity check
  if (checkAssets) {
    if (verbose) console.log('🖼️  Checking asset references...');
    
    try {
      const assetCheck = await ContentIntegrityChecker.checkImageReferences();
      
      if (assetCheck.missing.length > 0) {
        console.log(`\n⚠️  Missing ${assetCheck.missing.length} referenced assets:`);
        assetCheck.missing.forEach(asset => console.log(`  - ${asset}`));
      }
      
      if (verbose && assetCheck.found.length > 0) {
        console.log(`\n✅ Found ${assetCheck.found.length} valid asset references`);
      }
    } catch (error) {
      console.error('❌ Asset check failed:', error);
    }
  }
  
  // Link validation
  if (checkLinks) {
    if (verbose) console.log('🔗 Checking external links...');
    
    try {
      const linkCheck = await ContentIntegrityChecker.checkExternalLinks();
      
      if (linkCheck.invalid.length > 0) {
        console.log(`\n⚠️  Found ${linkCheck.invalid.length} invalid URLs:`);
        linkCheck.invalid.forEach(url => console.log(`  - ${url}`));
      }
      
      if (verbose && linkCheck.unchecked.length > 0) {
        console.log(`\n🔗 Found ${linkCheck.unchecked.length} external URLs (not validated)`);
      }
    } catch (error) {
      console.error('❌ Link check failed:', error);
    }
  }
  
  // Exit handling
  if (exitOnError && !result.isValid) {
    process.exit(1);
  }
  
  return result;
}

/**
 * Validate specific content types
 */
export function validateSpecific(type: 'profile' | 'skills' | 'projects' | 'publications' | 'experience' | 'education'): ValidationResult {
  let result: ValidationResult;
  
  switch (type) {
    case 'profile':
      result = validateProfile();
      break;
    case 'skills':
      result = validateSkills();
      break;
    case 'projects':
      result = validateCollection('projects', require('./contentValidation').projectSchema);
      break;
    case 'publications':
      result = validateCollection('publications', require('./contentValidation').publicationSchema);
      break;
    case 'experience':
      result = validateCollection('experience', require('./contentValidation').experienceSchema);
      break;
    case 'education':
      result = validateCollection('education', require('./contentValidation').educationSchema);
      break;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
  
  console.log(formatValidationResults(result));
  return result;
}

/**
 * Quick validation for development use
 */
export function quickCheck(): boolean {
  const result = validateAllContent();
  
  if (result.isValid) {
    console.log('✅ Content validation passed!');
    if (result.warnings.length > 0) {
      console.log(`⚠️  ${result.warnings.length} warnings found`);
    }
  } else {
    console.log(`❌ Content validation failed with ${result.errors.length} errors`);
  }
  
  return result.isValid;
}

/**
 * Development helper - validates content and provides suggestions
 */
export async function devValidate(): Promise<void> {
  console.log('🚀 Development Content Validation\n');
  
  const result = await validateContent({
    verbose: true,
    checkAssets: true,
    checkLinks: true,
    exitOnError: false
  });
  
  // Provide development suggestions
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('\n🎉 Perfect! Your content is fully validated.');
    console.log('💡 Consider running this validation before each commit.');
  } else if (result.errors.length === 0) {
    console.log('\n✨ Good job! No errors found.');
    console.log('💡 Consider addressing the warnings for better content quality.');
  } else {
    console.log('\n🔧 Please fix the errors above before building.');
    console.log('💡 Run `npm run validate:content` to check your fixes.');
  }
}