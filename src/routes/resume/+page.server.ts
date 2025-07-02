import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

// Define types for our resume data
type PersonalInfo = {
  id: string;
  label: string;
  value: string;
  order: number;
};

type ResumeSkill = {
  id: string;
  name: string;
  percentage: number;
  category: string | null;
  order: number;
};

type ResumeStat = {
  id: string;
  value: string;
  label: string;
  order: number;
};

export const load: PageServerLoad = async ({ url }) => {
  try {
    // Get all resume sections with their items, ordered by section order and item order
    const sections = await prisma.resumeSection.findMany({
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get personal info items
    const personalInfo = await prisma.resumePersonalInfo.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    // Get skills with categories
    const skills = await prisma.resumeSkill.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    // Get stats
    const stats = await prisma.resumeStat.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    return {
      sections,
      personalInfo,
      skills,
      stats,
      url: url.href
    };
  } catch (err) {
    console.error('Error loading resume data:', err);
    throw error(500, 'Error loading resume data');
  }
};
