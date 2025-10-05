/**
 * Error handling utilities for content validation and build processes
 */

import type { ValidationResult, ValidationError } from './contentValidation';

export interface ContentError extends Error {
  file?: string;
  field?: string;
  severity: 'error' | 'warning';
}

/**
 * Creates a content-specific error with additional metadata
 */
export function createContentError(
  message: string, 
  file?: string, 
  field?: string, 
  severity: 'error' | 'warning' = 'error'
): ContentError {
  const error = new Error(message) as ContentError;
  error.file = file;
  error.field = field;
  error.severity = severity;
  return error;
}

/**
 * Handles validation results and provides appropriate error responses
 */
export function handleValidationResult(result: ValidationResult, throwOnError = false): void {
  if (result.errors.length > 0) {
    const errorMessage = `Content validation failed with ${result.errors.length} error(s):\n` +
      result.errors.map(err => `  - ${err.file}${err.field ? ` (${err.field})` : ''}: ${err.message}`).join('\n');
    
    if (throwOnError) {
      throw createContentError(errorMessage);
    } else {
      console.error('❌ ' + errorMessage);
    }
  }

  if (result.warnings.length > 0) {
    const warningMessage = `Found ${result.warnings.length} warning(s):\n` +
      result.warnings.map(warn => `  - ${warn.file}${warn.field ? ` (${warn.field})` : ''}: ${warn.message}`).join('\n');
    
    console.warn('⚠️  ' + warningMessage);
  }
}

/**
 * Graceful error handling for missing content files
 */
export function handleMissingContent<T>(
  contentLoader: () => T,
  fallback: T,
  contentType: string
): T {
  try {
    return contentLoader();
  } catch (error) {
    console.warn(`⚠️  Failed to load ${contentType} content, using fallback:`, error instanceof Error ? error.message : 'Unknown error');
    return fallback;
  }
}

/**
 * Validates required environment or build-time conditions
 */
export function validateBuildRequirements(): void {
  const requirements = [
    {
      check: () => process.env.NODE_ENV !== undefined,
      message: 'NODE_ENV environment variable is not set'
    },
    {
      check: () => {
        try {
          require('fs').accessSync('src/content', require('fs').constants.F_OK);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Content directory (src/content) is not accessible'
    }
  ];

  const failures = requirements.filter(req => !req.check());
  
  if (failures.length > 0) {
    const errorMessage = 'Build requirements not met:\n' + 
      failures.map(f => `  - ${f.message}`).join('\n');
    throw createContentError(errorMessage);
  }
}

/**
 * Safe content parsing with error recovery
 */
export function safeParseContent<T>(
  parser: () => T,
  fallback: T,
  errorContext: string
): T {
  try {
    return parser();
  } catch (error) {
    console.error(`❌ Failed to parse ${errorContext}:`, error instanceof Error ? error.message : 'Unknown error');
    console.log(`🔄 Using fallback content for ${errorContext}`);
    return fallback;
  }
}

/**
 * Collects and formats multiple validation errors for reporting
 */
export class ValidationErrorCollector {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  addError(file: string, message: string, field?: string): void {
    this.errors.push({
      file,
      message,
      field,
      severity: 'error'
    });
  }

  addWarning(file: string, message: string, field?: string): void {
    this.warnings.push({
      file,
      message,
      field,
      severity: 'warning'
    });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  report(): string {
    let report = '';
    
    if (this.errors.length > 0) {
      report += `❌ ${this.errors.length} Error(s):\n`;
      this.errors.forEach(error => {
        report += `  ${error.file}${error.field ? ` (${error.field})` : ''}: ${error.message}\n`;
      });
      report += '\n';
    }

    if (this.warnings.length > 0) {
      report += `⚠️  ${this.warnings.length} Warning(s):\n`;
      this.warnings.forEach(warning => {
        report += `  ${warning.file}${warning.field ? ` (${warning.field})` : ''}: ${warning.message}\n`;
      });
    }

    return report;
  }
}