<script lang="ts">
  import { formatDate } from "$lib/utils/date";
  import ProjectLayout from "$lib/layouts/ProjectLayout.svelte";
  import { marked } from 'marked';
  
  // Define interfaces for the data structure
  interface Category {
    id: string;
    name: string;
    slug: string;
  }
  
  interface MediaItem {
    id: string;
    path: string;
    alt: string | null;
    title: string | null;
  }
  
  interface ProjectData {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string | null;
    client: string | null;
    completionDate: string | null;
    technologies: string | null;
    websiteUrl: string | null;
    githubUrl: string | null;
    createdAt: string;
    updatedAt: string;
    categories: Category[];
    images: MediaItem[];
  }
  
  interface SEO {
    title: string;
    description: string;
    image?: string;
    article: {
      publishedTime?: string;
      tags: string[];
      section: string;
    };
    jsonLd: Record<string, any>;
  }
  
  interface ProjectPageData {
    isMarkdown: boolean;
    content: any;
    metadata: any;
    project: ProjectData;
    seo: SEO;
  }
  
  // Using Svelte 5 runes
  let { data } = $props();
  
  // Type assertion for data
  const typedData = data as unknown as ProjectPageData;
  
  // Derive values from data
  const isMarkdown = $derived(typedData.isMarkdown);
  const content = $derived(typedData.content);
  const metadata = $derived(typedData.metadata);
  const project = $derived(typedData.project);
  const seo = $derived(typedData.seo);
  
  // Helper function to create gallery image objects
  function createGalleryImages(images: MediaItem[] | undefined): { url: string; alt: string }[] {
    if (!images || images.length === 0) return [];
    
    return images.map(image => ({
      url: image.path.startsWith('/') ? image.path : `/${image.path}`,
      alt: image.alt || ''
    }));
  }
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content={`https://ianwilson.info/portfolio/${metadata?.slug || project?.slug}`} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  {#if seo.image}
    <meta property="og:image" content={seo.image} />
  {/if}
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={`https://ianwilson.info/portfolio/${metadata?.slug || project?.slug}`} />
  <meta property="twitter:title" content={seo.title} />
  <meta property="twitter:description" content={seo.description} />
  {#if seo.image}
    <meta property="twitter:image" content={seo.image} />
  {/if}
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
    {JSON.stringify(seo.jsonLd)}
  </script>
</svelte:head>

{#if isMarkdown}
  <!-- Render markdown project -->
  <ProjectLayout
    title={metadata.title}
    description={metadata.description}
    client={metadata.client || ''}
    date={metadata.date}
    tags={metadata.tags || []}
    technologies={metadata.technologies || []}
    coverImage={metadata.coverImage}
    gallery={createGalleryImages(metadata.gallery)}
  >
    <div>
      {@render content?.(metadata)}
    </div>
  </ProjectLayout>
{:else}
  <!-- Render database project using ProjectLayout -->
  {#if project}
    <ProjectLayout
      title={project.title}
      description={project.description}
      client={project.client || ''}
      date={project.completionDate || project.createdAt}
      tags={project.categories?.map(cat => cat.name) || []}
      technologies={project.technologies ? project.technologies.split(',').map(tech => tech.trim()) : []}
      coverImage={project.images && project.images.length > 0 ? 
        (project.images[0].path.startsWith('/') ? project.images[0].path : `/${project.images[0].path}`) : 
        undefined}
      gallery={createGalleryImages(project.images?.slice(1))}
      websiteUrl={project.websiteUrl || null}
      githubUrl={project.githubUrl || null}
    >
      <div>
        {@html marked(project.content || '')}
      </div>
    </ProjectLayout>
  {/if}
{/if}
