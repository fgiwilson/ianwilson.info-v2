<script lang="ts">
  import type { BlogPost } from '$lib/types/blog';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  
  // Props from server
  const { data } = $props();
  
  // Using Svelte 5 runes for reactive state
  let allPosts = $state<BlogPost[]>(data.posts || []);
  let searchQuery = $state('');
  
  // Derived state for filtered posts based on search query
  // Using a regular function to help TypeScript understand the return type
  function getFilteredPosts(): BlogPost[] {
    if (!searchQuery.trim()) return allPosts;
    
    const query = searchQuery.toLowerCase().trim();
    return allPosts.filter((post: BlogPost) => 
      post.title.toLowerCase().includes(query) || 
      post.description.toLowerCase().includes(query) || 
      (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  }
  
  // Use the function in $derived
  let filteredPosts = $derived(getFilteredPosts());
  
  // Handle search input changes
  function handleSearch(e: Event): void {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Blog | Ian Wilson</title>
  <meta name="description" content="Articles and thoughts on web development, design, and technology" />
</svelte:head>

<section class="py-16">
  <div class="container mx-auto px-4">
    <header class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        <span class="text-primary">Blog</span>
      </h1>
      <p class="text-xl text-text-light max-w-2xl mx-auto">
        Articles and thoughts on web development, design, and technology
      </p>
    </header>
    
    <!-- Search and filter -->  
    <div class="mb-8 max-w-lg mx-auto">
      <div class="relative">
        <input 
          type="text" 
          placeholder="Search articles..." 
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          value={searchQuery}
          oninput={handleSearch}
        />
        <button 
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      <!-- Show result count when searching -->
      {#if searchQuery.trim()}
        <p class="text-sm text-text-light mt-2 text-center">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </p>
      {/if}
    </div>
    
    <!-- Blog posts grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each filteredPosts as post (post.slug)}
        <article class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
          <a href={`/blog/${post.slug}`} class="block">
            <div class="h-48 overflow-hidden">
              {#if post.coverImage}
                <OptimizedImage 
                  src={typeof post.coverImage === 'string' ? 
                    post.coverImage : 
                    (post.coverImage.path || post.coverImage.url || '')}
                  alt={post.title}
                  width={480}
                  height={288}
                  class="w-full h-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              {:else}
                <div class="bg-gray-200 w-full h-full flex items-center justify-center">
                  <span class="text-gray-400">No image</span>
                </div>
              {/if}
            </div>
          </a>
          
          <div class="p-6">
            <div class="flex items-center text-sm text-text-light mb-2">
              <time datetime={post.date}>
                {formatDate(post.date)}
              </time>
              {#if post.readingTime}
                <span class="mx-2">•</span>
                <span>{post.readingTime} min read</span>
              {/if}
            </div>
            
            <h2 class="text-xl font-bold mb-2 text-primary hover:text-accent transition-colors">
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>
            
            <p class="text-text-light mb-4 line-clamp-3">{post.description}</p>
            
            {#if post.tags && post.tags.length > 0}
              <div class="flex flex-wrap gap-2 mt-4">
                {#each post.tags as tag}
                  <a href={`/blog/tag/${tag}`} class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors">
                    #{tag}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
      
      {#if filteredPosts.length === 0}
        <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
          <p class="text-lg text-text-light">
            No posts found matching your search criteria.
          </p>
          {#if searchQuery.trim()}
            <button 
              class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              onclick={() => searchQuery = ''}
            >
              Clear search
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>
