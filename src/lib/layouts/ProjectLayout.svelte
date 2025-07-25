<script lang="ts">
  import { onMount } from 'svelte';
  import '@awesome.me/kit-b2c306474b/icons/css/all.min.css';
  
  // Get the frontmatter metadata from the markdown file using Svelte 5 runes
  let {
    title,
    description,
    client,
    date,
    tags = [],
    technologies = [],
    coverImage,
    gallery = [],
    websiteUrl = null,
    githubUrl = null,
    children // Add children prop to receive content
  } = $props();
  
  // Define the custom window interface for TypeScript
  interface CustomWindow extends Window {
    imageModal?: {
      open: (imageUrl: string, alt?: string) => void;
      close: () => void;
    };
  }
  
  // Function to open modal for gallery images
  function openImageModal(imageUrl: string, alt: string) {
    const customWindow = window as unknown as CustomWindow;
    if (customWindow.imageModal) {
      customWindow.imageModal.open(imageUrl, alt);
    }
  }
  
  // Add modal functionality to gallery images after mount
  onMount(() => {
    // Add click handlers to project gallery images
    const galleryImages = document.querySelectorAll('.project-gallery-image');
    galleryImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const imageUrl = imgElement.src;
      const imageAlt = imgElement.alt;
      
      // Make image clickable
      imgElement.style.cursor = 'pointer';
      imgElement.tabIndex = 0;
      imgElement.setAttribute('role', 'button');
      imgElement.setAttribute('aria-label', `View ${imageAlt} in full size`);
      
      // Add click handler
      imgElement.onclick = () => {
        openImageModal(imageUrl, imageAlt);
      };
      
      // Add keyboard handler
      imgElement.onkeydown = (e) => {
        if (e.key === 'Enter') {
          openImageModal(imageUrl, imageAlt);
        }
      };
    });
  });
</script>

<article class="project-case-study max-w-5xl mx-auto px-4 py-8">
  <header class="mb-12">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">{title}</h1>
    
    {#if description}
      <p class="text-xl text-text-light mb-6">{description}</p>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div>
        {#if coverImage}
          <div class="rounded-lg overflow-hidden shadow-md">
            <img 
              src={coverImage} 
              alt={`Cover image for ${title}`} 
              class="w-full h-64 md:h-80 object-cover"
            />
          </div>
        {/if}
      </div>
      
      <div class="bg-background-alt p-6 rounded-lg shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-primary mb-2">Project Details</h3>
          
          {#if client}
            <div class="flex items-start mb-2">
              <span class="font-medium w-24">Client:</span>
              <span>{client}</span>
            </div>
          {/if}
          
          {#if date}
            <div class="flex items-start mb-2">
              <span class="font-medium w-24">Completed:</span>
              <span>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            </div>
          {/if}
        </div>
        
        {#if technologies && technologies.length > 0}
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-primary mb-2">Technologies</h3>
            <div class="flex flex-wrap gap-2">
              {#each technologies as tech}
                <span class="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {tech}
                </span>
              {/each}
            </div>
          </div>
        {/if}
        
        {#if tags && tags.length > 0}
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-primary mb-2">Categories</h3>
            <div class="flex flex-wrap gap-2">
              {#each tags as tag}
                <a href={`/portfolio/category/${tag}`} class="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full hover:bg-accent/20 transition-colors">
                  {tag}
                </a>
              {/each}
            </div>
          </div>
        {/if}
        
        {#if websiteUrl || githubUrl}
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-primary mb-2">Links</h3>
            <div class="flex flex-wrap gap-3">
              {#if websiteUrl}
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="inline-flex items-center text-primary hover:text-accent transition-colors"
                >
                  <i class="fa-sharp fa-light fa-globe fa-xl"></i>
                  Visit Website
                </a>
              {/if}
              
              {#if githubUrl}
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="inline-flex items-center text-primary hover:text-accent transition-colors"
                >
                  <i class="fa-brands fa-github fa-xl"></i>
                  View Source
                </a>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </header>
  
  {#if gallery && gallery.length > 0}
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-primary mb-6">Project Gallery</h2>
      <div class="flex flex-row gap-4">
        {#each gallery as image}
          <div class="flex rounded-lg overflow-hidden shadow-md flex-1 hover:shadow-lg transition-shadow duration-300">
            <img 
              src={image.url} 
              alt={image.alt || `${title} gallery image`} 
              class="project-gallery-image w-full h-full object-contain hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <div class="prose prose-lg max-w-none">
    <!-- Render markdown content -->
    {@render children()}
  </div>
  
  <div class="mt-12 pt-8 border-t border-gray-200">
    <a href="/portfolio" class="inline-flex items-center text-primary hover:text-accent transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to all projects
    </a>
  </div>
</article>
