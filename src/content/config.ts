import { defineCollection, z } from 'astro:content';

// Define schemas first
const profileSchema = z.object({
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  email: z.string().email(),
  location: z.string(),
  profileImage: z.string(),
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
      name: z.string(),
      skills: z.array(
        z.object({
          name: z.string(),
          level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
          color: z.string(),
        })
      ),
    })
  ),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
  github: z.string().url().optional(),
  demo: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  tags: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  award: z.string().optional(),
  hackathon: z.string().optional(),
  teamSize: z.number().optional(),
  paper: z.string().url().optional(),
  paperTitle: z.string().optional(),
  venue: z.string().optional(),
});

const publicationSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  venue: z.string(),
  year: z.number(),
  url: z.string().url().optional(),
  type: z.enum(['conference', 'journal', 'patent', 'preprint']),
  doi: z.string().optional(),
  abstract: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string(),
  logo: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  coursework: z.array(z.string()).optional(),
  thesis: z.string().optional(),
  advisors: z.array(z.object({
    name: z.string(),
    googleScholar: z.string().optional(),
  })).optional(),
});

// Collections using the defined schemas
const profileCollection = defineCollection({
  type: 'content',
  schema: profileSchema,
});

const skillsCollection = defineCollection({
  type: 'content',
  schema: skillsSchema,
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: projectSchema,
});

const publicationsCollection = defineCollection({
  type: 'content',
  schema: publicationSchema,
});

const experienceCollection = defineCollection({
  type: 'content',
  schema: experienceSchema,
});

const educationCollection = defineCollection({
  type: 'content',
  schema: educationSchema,
});

// Export collections
export const collections = {
  profile: profileCollection,
  skills: skillsCollection,
  projects: projectsCollection,
  publications: publicationsCollection,
  experience: experienceCollection,
  education: educationCollection,
};

// Export schema types for use in components
export type ProfileData = z.infer<typeof profileSchema>;
export type SkillsData = z.infer<typeof skillsSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type PublicationData = z.infer<typeof publicationSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;