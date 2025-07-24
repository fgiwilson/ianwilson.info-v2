<script>
  import {marked} from 'marked';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  import '@awesome.me/kit-b2c306474b/icons/css/all.min.css';
  
  // Get the frontmatter metadata from the markdown file using Svelte 5 runes
  let { 
    title, 
    date, 
    description, 
    tags = [], 
    coverImage = null, 
    readingTime,
    children // Add children prop to receive content
  } = $props();
  
  // Share functions
  function shareOnBlueSky() {
    if (!browser) return;
    const url = $page.url.href;
    const text = `${title}${description ? ' - ' + description : ''}`;
    const shareText = `${text}\n\n${url}`;
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`;
    window.open(blueskyUrl, '_blank', 'width=600,height=400');
  }
  
  function shareOnLinkedIn() {
    if (!browser) return;
    const url = $page.url.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  }
</script>

<article class="blog-post max-w-4xl mx-auto px-4 py-8">
  <header class="mb-8">
    {#if coverImage}
      <div class="mb-6 rounded-lg overflow-hidden shadow-md">
        <img 
          src={typeof coverImage === 'object' ? (coverImage.path || coverImage.url) : coverImage} 
          alt={`Cover image for ${title}`} 
          class="w-full h-64 md:h-96 object-cover"
        />
      </div>
    {/if}
    
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">{title}</h1>
    
    <div class="flex flex-wrap items-center text-text-light mb-4">
      <time datetime={new Date(date).toISOString().split('T')[0]} class="flex items-center mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
      
      {#if readingTime}
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readingTime} min read
        </span>
      {/if}
    </div>
    
    {#if tags && tags.length > 0}
      <div class="flex flex-wrap gap-2 mb-4">
        {#each tags as tag}
          <a href={`/blog/tag/${tag}`} class="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
            #{tag}
          </a>
        {/each}
      </div>
    {/if}
    
    {#if description}
      <p class="text-xl text-text-light">{description}</p>
    {/if}
  </header>
  
  <div class="prose prose-lg max-w-none">
    <!-- Render markdown content -->
    {@render children()}
  </div>
  
  <div class="mt-12 pt-8 border-t border-gray-200">
    <div class="flex justify-between items-center">
      <a href="/blog" class="inline-flex items-center text-primary hover:text-accent transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all posts
      </a>
      
      <div class="flex space-x-4">
        <button 
          onclick={shareOnBlueSky}
          class="text-text-light hover:text-accent transition-colors cursor-pointer" 
          aria-label="Share on BlueSky"
        >
          <i class="fa-brands fa-bluesky fa-xl"></i>
        </button>
        <button 
          onclick={shareOnLinkedIn}
          class="text-text-light hover:text-accent transition-colors cursor-pointer" 
          aria-label="Share on LinkedIn"
        >
          <i class="fa-brands fa-linkedin fa-xl"></i>
        </button>
      </div>
    </div>
  </div>
</article>
