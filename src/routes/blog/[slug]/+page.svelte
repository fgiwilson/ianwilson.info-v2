<script>
  import { formatDate } from '$lib/utils/date';
  import BlogLayout from '$lib/layouts/BlogLayout.svelte';
  import { marked } from 'marked';
  
  // Using Svelte 5 runes
  let { data } = $props();
  
  // Determine if this is a markdown post or database post
  const isMarkdown = $derived(data.isMarkdown);
  
  // For markdown posts
  const content = $derived(isMarkdown ? data.content : null);
  const metadata = $derived(isMarkdown ? data.metadata : null);
  
  // For database posts
  const post = $derived(!isMarkdown ? data.post : null);
</script>

<svelte:head>
  <title>{data.title} | Ian Wilson</title>
  <meta name="description" content={data.description} />
</svelte:head>

<!-- Markdown-based blog post -->
{#if isMarkdown && content}
  {@const Component = content}
  <Component {...metadata} />
{:else if post}
  <!-- Database-backed blog post using BlogLayout -->
  <BlogLayout
    title={post.title}
    date={post.publishedAt || post.createdAt}
    description={post.excerpt || ''}
    tags={post.tags?.map(tag => tag.name) || []}
    coverImage={post.coverImage?.path || null}
    readingTime={Math.ceil((post.content?.length || 0) / 1500)}
  >
    <div>
      {@html marked(post.content || '')}
    </div>
    
    {#if post.images && post.images.length > 0}
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each post.images as image}
          <div>
            <img 
              src={image.path} 
              alt={image.alt || ''} 
              class="w-full h-auto rounded-md shadow"
            />
          </div>
        {/each}
      </div>
    {/if}
  </BlogLayout>
{/if}
