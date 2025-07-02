import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { generateProjectJsonLd, defaultMeta } from '$lib/utils/seo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    // Fetch project from database by slug
    const project = await prisma.project.findUnique({
      where: { 
        slug: params.slug 
      },
      include: {
        categories: true,
        images: true,
        author: true
      }
    });

    // If project not found, try to load from markdown as fallback
    if (!project) {
      try {
        // Dynamic import of the markdown file based on the slug
        const markdownProject = await import(`../../../routes/portfolio/${params.slug}.md`);
        
        // Get the metadata from the frontmatter
        const metadata = markdownProject.metadata;
        
        // Prepare SEO data
        const title = metadata.title;
        const description = metadata.description || metadata.excerpt || 
          `View ${metadata.title} - a project by Ian Wilson`;
        const image = metadata.coverImage || defaultMeta.image;
        const projectDate = metadata.date ? new Date(metadata.date).toISOString() : undefined;
        
        // Generate JSON-LD structured data
        const jsonLd = generateProjectJsonLd({
          title: metadata.title,
          description,
          date: metadata.date || new Date().toISOString(),
          slug: params.slug,
          coverImage: metadata.coverImage,
          tags: metadata.tags || []
          // client property removed as it's not in the type definition
        });
        
        return {
          content: markdownProject.default,
          metadata,
          seo: {
            title: `${title} | Portfolio`,
            description,
            image,
            jsonLd
          },
          isMarkdown: true
        };
      } catch (markdownError) {
        console.error('Error loading markdown project:', markdownError);
        throw error(404, 'Project not found');
      }
    }

    // Prepare SEO data for database project
    const title = project.title;
    const description = project.description || 
      `View ${project.title} - a project by ${project.author?.name || 'Ian Wilson'}`;
    
    // Get first image as cover image or use default
    const coverImage = project.images && project.images.length > 0
      ? project.images[0].path
      : defaultMeta.image;
    
    // Generate JSON-LD structured data
    const jsonLd = generateProjectJsonLd({
      title: project.title,
      description,
      date: project.createdAt.toISOString(),
      slug: params.slug,
      coverImage,
      tags: project.categories.map(cat => cat.name)
      // client property removed as it's not in the type definition
    });
    
    return {
      project,
      seo: {
        title: `${title} | Portfolio`,
        description,
        image: coverImage,
        jsonLd
      },
      isMarkdown: false
    };
  } catch (err) {
    console.error('Error loading project:', err);
    throw error(404, 'Project not found');
  }
};
