# Content Validation System

This document describes the comprehensive content validation system implemented for the ML Engineer Portfolio project.

## Overview

The content validation system ensures that all Markdown content files are properly formatted, complete, and reference valid assets. It provides both build-time validation and development-time checking capabilities.

## Components

### 1. Core Validation (`src/utils/contentValidation.ts`)

The main validation module provides:

- **Schema Validation**: Validates frontmatter against Zod schemas
- **Content Completeness**: Checks for missing required fields
- **Asset Validation**: Verifies that referenced images and logos exist
- **Error Handling**: Provides detailed error messages and warnings

#### Key Functions

```typescript
// Validate all content across the site
validateAllContent(): ValidationResult

// Validate specific content types
validateProfile(): ValidationResult
validateSkills(): ValidationResult
validateCollection(name: string, schema: ZodSchema): ValidationResult

// Content completeness checking
checkMissingContent(): { missing: string[], found: string[], recommendations: string[] }
validateContentCompleteness(): { score: number, suggestions: string[], ... }

// Report generation
generateValidationReport(): string
```

### 2. Content Helpers (`src/utils/contentHelpers.ts`)

Provides utility functions for development and runtime use:

- **ContentValidator**: Quick validation helpers for specific content types
- **ContentIntegrityChecker**: Asset and link validation
- **ContentStats**: Content statistics and summaries

### 3. Build Validation (`src/utils/buildValidation.ts`)

Build-time validation utilities:

- **validateForBuild()**: Comprehensive build-time validation
- **validateForDev()**: Quick validation for development
- **createValidationMiddleware()**: Astro middleware for validation
- **validateForCommit()**: Pre-commit validation hook
- **getContentHealthReport()**: Content health summary

### 4. CLI Validation (`src/utils/validateCLI.ts`)

Command-line interface for validation:

- **validateContent()**: Main CLI validation function with options
- **validateSpecific()**: Validate specific content types
- **quickCheck()**: Quick validation check
- **devValidate()**: Development validation with suggestions

### 5. Build Script (`scripts/validate-content.js`)

Standalone JavaScript validation script that:

- Validates all content files
- Provides detailed error and warning reports
- Supports watch mode for development
- Integrates with the build process

## Usage

### Build-Time Validation

Content validation is automatically run during the build process:

```bash
npm run build  # Includes validation step
```

### Development Validation

Run validation manually during development:

```bash
# Validate all content
npm run validate:content

# Watch for changes and validate
npm run validate:content:watch
```

### Programmatic Usage

```typescript
import { validateAllContent, validateForBuild } from './src/utils/contentValidation';

// Basic validation
const result = validateAllContent();
if (!result.isValid) {
  console.error('Validation failed:', result.errors);
}

// Build validation with options
await validateForBuild({
  failOnWarnings: false,
  checkAssets: true,
  checkLinks: false,
  verbose: true
});
```

## Validation Rules

### Profile Content (`src/content/profile/main.md`)

Required fields:
- `name`: Full name
- `title`: Professional title
- `bio`: Professional biography (min 10 characters)
- `email`: Valid email address
- `location`: Current location
- `profileImage`: Path to profile image
- `social`: Social media links (optional)

### Skills Content (`src/content/skills/main.md`)

Required structure:
- `categories`: Array of skill categories
  - `name`: Category name
  - `skills`: Array of skills
    - `name`: Skill name
    - `level`: One of 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    - `color`: Color identifier

### Collections (Projects, Publications, Experience, Education)

Each collection item must have:
- Valid frontmatter according to schema
- Content body (recommended min 50 characters)
- Valid image/logo paths (if specified)
- Valid URLs (if specified)

## Error Types

### Errors (Build-Breaking)
- Missing required fields
- Invalid data types
- Invalid email/URL formats
- Schema validation failures

### Warnings (Non-Breaking)
- Missing optional fields
- Short content (< 50 characters)
- Missing referenced assets
- Empty collections

## Integration Points

### 1. Package.json Scripts
```json
{
  "build": "npm run validate:content && astro check && astro build",
  "validate:content": "node scripts/validate-content.js",
  "validate:content:watch": "node scripts/validate-content.js --watch"
}
```

### 2. Astro Content Collections
The validation system works seamlessly with Astro's content collections, using the same Zod schemas for both runtime and validation.

### 3. Development Workflow
- Validation runs automatically on build
- Watch mode provides real-time feedback
- Detailed error messages help fix issues quickly

## Customization

### Adding New Content Types

1. Define schema in `src/content/config.ts`
2. Add validation functions in `src/utils/contentValidation.ts`
3. Update CLI and build scripts as needed

### Modifying Validation Rules

Update the Zod schemas in `src/content/config.ts` to change validation rules. The validation system will automatically use the updated schemas.

### Custom Validation Checks

Add custom validation logic in the validation utilities:

```typescript
// Custom validation example
export function validateCustomRule(content: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Add your custom validation logic here
  
  return { isValid: errors.length === 0, errors, warnings: [] };
}
```

## Best Practices

1. **Run validation frequently** during development
2. **Fix errors before warnings** - errors break the build
3. **Use meaningful commit messages** when fixing validation issues
4. **Keep content schemas up to date** with your needs
5. **Monitor validation reports** for content quality insights

## Troubleshooting

### Common Issues

1. **"Referenced image file not found"**
   - Ensure image files exist in the `public/` directory
   - Check file paths in frontmatter

2. **"Invalid URL format"**
   - Ensure URLs include protocol (http:// or https://)
   - Check for typos in URLs

3. **"Schema validation failed"**
   - Check frontmatter syntax (YAML format)
   - Ensure required fields are present
   - Verify data types match schema

### Debug Mode

Run validation with verbose output:

```bash
# JavaScript validation with full output
node scripts/validate-content.js

# TypeScript validation (in development)
npm run dev  # Validation runs automatically
```

## Performance

The validation system is optimized for:
- **Fast execution**: Validates all content in < 1 second
- **Minimal dependencies**: Uses only Zod and built-in Node.js modules
- **Efficient caching**: Reuses parsed content where possible
- **Incremental validation**: Watch mode only validates changed files