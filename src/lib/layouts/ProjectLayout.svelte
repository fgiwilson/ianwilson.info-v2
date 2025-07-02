<script>
  import { marked } from 'marked';
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
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
          <div class="flex rounded-lg overflow-hidden shadow-md flex-1">
            <img 
              src={image.url} 
              alt={image.alt || `${title} gallery image`} 
              class="w-full h-full object-cover"
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
