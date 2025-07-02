<script lang="ts">
  import { formatDate } from '$lib/utils/date';
  
  // Props from server
  const { data } = $props();
  
  // State
  let activeCategory = $state('all');
  
  // Derived values
  const projects = $derived(data.projects || []);
  const categories = $derived(data.categories || []);
  
  // Filter projects by category
  const filteredProjects = $derived(
    activeCategory === 'all'
      ? projects
      : projects.filter(project => 
          project.categories.some(cat => cat.id === activeCategory)
        )
  );
  
  // Set active category
  function setCategory(categoryId: string) {
    activeCategory = categoryId;
  }
</script>

<svelte:head>
  <title>Portfolio | Ian Wilson</title>
  <meta name="description" content="Featured projects and case studies showcasing my web development work" />
</svelte:head>

<section class="py-16">
  <div class="container mx-auto px-4">
    <header class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        <span class="text-primary">Portfolio</span>
      </h1>
      <p class="text-xl text-text-light max-w-2xl mx-auto">
        Featured projects and case studies showcasing my web development work
      </p>
    </header>
    
    <!-- Category filters -->
    <div class="flex flex-wrap justify-center gap-2 mb-12">
      <button 
        class="px-4 py-2 rounded-full text-sm transition-colors {activeCategory === 'all' ? 'bg-primary text-white' : 'bg-background-alt text-text-light hover:bg-primary/10'}"
        onclick={() => setCategory('all')}
      >
        All Projects
      </button>
      {#each categories as category}
        <button 
          class="px-4 py-2 rounded-full text-sm transition-colors {activeCategory === category.id ? 'bg-primary text-white' : 'bg-background-alt text-text-light hover:bg-primary/10'}"
          onclick={() => setCategory(category.id)}
        >
          {category.name}
        </button>
      {/each}
    </div>
    
    <!-- Projects grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each filteredProjects as project}
        <article class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
          <a href={`/portfolio/${project.slug}`} class="block">
            <div class="h-48 overflow-hidden">
              {#if project.images && project.images.length > 0}
                <img 
                  src={project.images[0].path.startsWith('/') ? project.images[0].path : `/${project.images[0].path}`} 
                  alt={project.images[0].alt || project.title}
                  class="w-full h-full object-cover transition-transform hover:scale-105"
                />
              {:else}
                <div class="w-full h-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
            </div>
          </a>
          
          <div class="p-6">
            <h2 class="text-xl font-bold mb-2 text-primary hover:text-accent transition-colors">
              <a href={`/portfolio/${project.slug}`}>{project.title}</a>
            </h2>
            
            <p class="text-text-light mb-4 line-clamp-3">{project.description}</p>
            
            {#if project.author && project.author.name}
              <div class="text-sm text-text-light mb-4">
                <span class="font-medium">By:</span> {project.author.name}
              </div>
            {/if}
            
            {#if project.categories && project.categories.length > 0}
              <div class="flex flex-wrap gap-2 mt-4">
                {#each project.categories as category}
                  <a href={`/portfolio/category/${category.slug}`} class="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full hover:bg-accent/20 transition-colors">
                    {category.name}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>
