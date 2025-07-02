import { prisma } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const postCount = await prisma.blogPost.count();
    const recentPosts = await prisma.blogPost.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        }
    });
    const recentProjects = await prisma.project.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        }
    });
    const projectCount = await prisma.project.count();
    const mediaCount = await prisma.media.count();
    const tagCount = await prisma.tag.count();
    const viewCount = await prisma.blogPost.count({
        where: {
            publishedAt: {
                not: null
            }
        }
    });
    return { postCount, recentPosts, recentProjects, projectCount, mediaCount, tagCount, viewCount };
};