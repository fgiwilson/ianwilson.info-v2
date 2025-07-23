<script>
  import {marked} from 'marked';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  
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
          class="text-text-light hover:text-accent transition-colors" 
          aria-label="Share on BlueSky"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 2.104.139 3.25.139 5.24.902 6.386c.763 1.146 3.634 1.468 6.798-.473C10.954 4.766 12 2.652 12 10.8z"/>
            <path d="M12 13.2c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3.701.763-1.146.763-3.136 0-4.282-.763-1.146-3.634-1.468-6.798.473C13.046 19.234 12 21.348 12 13.2z"/>
          </svg>
        </button>
        <button 
          onclick={shareOnLinkedIn}
          class="text-text-light hover:text-accent transition-colors" 
          aria-label="Share on LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</article>
