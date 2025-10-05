/**
 * Build-time validation utilities for Astro integration
 * These functions can be called during the build process to ensure content integrity
 */

import { validateAllContent, formatValidationResults, type ValidationResult } from './contentValidation';
import { ContentIntegrityChecker } from './contentHelpers';

export interface BuildValidationOptions {
  failOnWarnings?: boolean;
  checkAssets?: boolean;
  checkLinks?: boolean;
  verbose?: boolean;
}

/**
 * Comprehensive build-time validation
 * This function should be called during the build process to ensure all content is valid
 */
export async function validateForBuild(options: BuildValidationOptions = {}): Promise<void> {
  const { 
    failOnWarnings = false, 
    checkAssets = true, 
    checkLinks = false, 
    verbose = false 
  } = options;

  if (verbose) {
    console.log('🔍 Running build-time content validation...\n');
  }

  // Core content validation
  const contentResult = validateAllContent();
  
  if (verbose || !contentResult.isValid || contentResult.warnings.length > 0) {
    console.log(formatValidationResults(contentResult));
  }

  // Asset validation
  let assetErrors = 0;
  if (checkAssets) {
    try {
      const assetCheck = await ContentIntegrityChecker.checkImageReferences();
      
      if (assetCheck.missing.length > 0) {
        console.error(`\n❌ Missing ${assetCheck.missing.length} referenced assets:`);
        assetCheck.missing.forEach(asset => console.error(`  - ${asset}`));
        assetErrors = assetCheck.missing.length;
      }
      
      if (verbose && assetCheck.found.length > 0) {
        console.log(`\n✅ Found ${assetCheck.found.length} valid asset references`);
      }
    } catch (error) {
      console.error('❌ Asset validation failed:', error);
      assetErrors = 1;
    }
  }

  // Link validation (optional, can be slow)
  let linkErrors = 0;
  if (checkLinks) {
    try {
      const linkCheck = await ContentIntegrityChecker.checkExternalLinks();
      
      if (linkCheck.invalid.length > 0) {
        console.error(`\n❌ Found ${linkCheck.invalid.length} invalid URLs:`);
        linkCheck.invalid.forEach(url => console.error(`  - ${url}`));
        linkErrors = linkCheck.invalid.length;
      }
      
      if (verbose && linkCheck.unchecked.length > 0) {
        console.log(`\n🔗 Found ${linkCheck.unchecked.length} external URLs (basic validation only)`);
      }
    } catch (error) {
      console.error('❌ Link validation failed:', error);
      linkErrors = 1;
    }
  }

  // Determine if build should fail
  const hasErrors = !contentResult.isValid || assetErrors > 0 || linkErrors > 0;
  const hasWarnings = contentResult.warnings.length > 0;
  
  if (hasErrors) {
    throw new Error('Build validation failed due to content errors. Please fix the issues above.');
  }
  
  if (failOnWarnings && hasWarnings) {
    throw new Error('Build validation failed due to content warnings. Set failOnWarnings to false to ignore warnings.');
  }

  if (verbose) {
    console.log('\n✅ Build validation completed successfully!');
  }
}

/**
 * Quick validation for development builds
 */
export function validateForDev(): boolean {
  const result = validateAllContent();
  
  if (!result.isValid) {
    console.error('❌ Content validation failed:');
    console.error(formatValidationResults(result));
    return false;
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Content validation passed with warnings:');
    console.warn(formatValidationResults(result));
  }
  
  return true;
}

/**
 * Validation middleware for Astro development server
 * Can be used in astro.config.mjs to validate content during development
 */
export function createValidationMiddleware(options: BuildValidationOptions = {}) {
  return {
    name: 'content-validation',
    configResolved() {
      // Run validation when config is resolved
      if (options.verbose) {
        console.log('🔍 Content validation middleware enabled');
      }
    },
    buildStart() {
      // Validate content at build start
      const isValid = validateForDev();
      if (!isValid && process.env.NODE_ENV === 'production') {
        throw new Error('Content validation failed. Cannot proceed with production build.');
      }
    }
  };
}

/**
 * Pre-commit validation hook
 * Can be used in git hooks or CI/CD pipelines
 */
export async function validateForCommit(): Promise<boolean> {
  console.log('🔍 Running pre-commit content validation...\n');
  
  try {
    await validateForBuild({
      failOnWarnings: false,
      checkAssets: true,
      checkLinks: false,
      verbose: true
    });
    
    console.log('✅ Pre-commit validation passed!');
    return true;
  } catch (error) {
    console.error('❌ Pre-commit validation failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Content health check - provides a summary of content status
 */
export async function getContentHealthReport(): Promise<{
  isHealthy: boolean;
  summary: {
    totalErrors: number;
    totalWarnings: number;
    missingAssets: number;
    collections: Record<string, number>;
  };
  details: ValidationResult;
}> {
  const contentResult = validateAllContent();
  const assetCheck = await ContentIntegrityChecker.checkImageReferences();
  
  // Count files in each collection
  const fs = await import('fs');
  const path = await import('path');
  const collections: Record<string, number> = {};
  
  const contentDirs = ['profile', 'skills', 'projects', 'publications', 'experience', 'education'];
  
  for (const dir of contentDirs) {
    const dirPath = path.join(process.cwd(), 'src/content', dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
      collections[dir] = files.length;
    } else {
      collections[dir] = 0;
    }
  }
  
  return {
    isHealthy: contentResult.isValid && assetCheck.missing.length === 0,
    summary: {
      totalErrors: contentResult.errors.length,
      totalWarnings: contentResult.warnings.length,
      missingAssets: assetCheck.missing.length,
      collections
    },
    details: contentResult
  };
}