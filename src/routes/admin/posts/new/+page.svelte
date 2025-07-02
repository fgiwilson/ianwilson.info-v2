<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  
  // Form state
  interface PostState {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured: boolean;
    tags: string[];
  }
  
  const post = $state<PostState>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured: false,
    tags: []
  });
  
  // Preview state
  let showPreview = $state(false);
  const previewContent = $derived(post.content);
  
  // Available tags (would normally come from the server)
  interface Tag {
    id: string;
    name: string;
  }
  
  const availableTags = $state<Tag[]>([]);
  
  // Error state
  const errors = $state({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    general: ''
  });
  
  // Auto-generate slug from title
  function generateSlug() {
    if (post.title) {
      post.slug = post.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }
  
  // Mock data loading
  onMount(() => {
    // Simulate loading tags
    setTimeout(() => {
      availableTags.push(
        { id: '1', name: 'SvelteKit' },
        { id: '2', name: 'JavaScript' },
        { id: '3', name: 'TypeScript' },
        { id: '4', name: 'Web Development' },
        { id: '5', name: 'CSS' },
        { id: '6', name: 'TailwindCSS' }
      );
    }, 300);
  });
  
  // Toggle tag selection
  function toggleTag(tagId: string) {
    const index = post.tags.indexOf(tagId);
    if (index === -1) {
      post.tags = [...post.tags, tagId];
    } else {
      post.tags = post.tags.filter(id => id !== tagId);
    }
  }
  
  // Form submission handler
  const handleEnhance = ({ formData }: { formData: FormData }) => {
    // Reset errors
    errors.title = '';
    errors.slug = '';
    errors.content = '';
    errors.excerpt = '';
    errors.general = '';
    
    // Validate form
    let isValid = true;
    
    const formTitle = formData.get('title');
    const formSlug = formData.get('slug');
    const formContent = formData.get('content');
    
    if (!formTitle) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formSlug) {
      errors.slug = 'Slug is required';
      isValid = false;
    }
    
    if (!formContent) {
      errors.content = 'Content is required';
      isValid = false;
    }
    
    if (!isValid) {
      return { cancel: true };
    }
    
    return async ({ result }: { result: { type: string; data?: { message?: string, postId?: string } } }) => {
      if (result.type === 'failure') {
        errors.general = result.data?.message || 'Failed to create post. Please try again.';
      } else if (result.type === 'success' && result.data?.postId) {
        // Redirect to edit page with the new post ID
        window.location.href = `/admin/posts/${result.data.postId}/edit?created=true`;
      }
    };
  };
</script>

<svelte:head>
  <title>New Blog Post | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">New Blog Post</h1>
    <div class="flex space-x-3">
      <button
        type="button"
        onclick={() => showPreview = !showPreview}
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {showPreview ? 'Edit' : 'Preview'}
      </button>
      <a 
        href="/admin/posts" 
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
    </div>
  </div>
  
  {#if errors.general}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{errors.general}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="bg-white shadow overflow-hidden rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      {#if showPreview}
        <!-- Preview Mode -->
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{post.title || 'Untitled Post'}</h2>
            {#if post.excerpt}
              <p class="mt-2 text-gray-600">{post.excerpt}</p>
            {/if}
          </div>
          
          <div class="prose max-w-none">
            <!-- This would normally use a markdown renderer -->
            <div class="p-4 border rounded bg-gray-50">
              <pre class="whitespace-pre-wrap">{previewContent}</pre>
            </div>
          </div>
        </div>
      {:else}
        <!-- Edit Mode -->
        <form method="POST" use:enhance={handleEnhance as any} class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              bind:value={post.title}
              onblur={generateSlug}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Post title"
            />
            {#if errors.title}
              <p class="mt-2 text-sm text-red-600">{errors.title}</p>
            {/if}
          </div>
          
          <!-- Slug -->
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                /blog/
              </span>
              <input
                type="text"
                name="slug"
                id="slug"
                bind:value={post.slug}
                onblur={generateSlug}
                class="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="post-slug"
              />
            </div>
            {#if errors.slug}
              <p class="mt-2 text-sm text-red-600">{errors.slug}</p>
            {/if}
          </div>
          
          <!-- Excerpt -->
          <div>
            <label for="excerpt" class="block text-sm font-medium text-gray-700">
              Excerpt
              <span class="text-gray-500">(optional)</span>
            </label>
            <div class="mt-1">
              <textarea
                id="excerpt"
                name="excerpt"
                rows="3"
                bind:value={post.excerpt}
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Brief summary of the post"
              ></textarea>
            </div>
            {#if errors.excerpt}
              <p class="mt-2 text-sm text-red-600">{errors.excerpt}</p>
            {/if}
          </div>
          
          <!-- Content -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700">Content (Markdown)</label>
            <div class="mt-1">
              <textarea
                id="content"
                name="content"
                rows="15"
                bind:value={post.content}
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary font-mono text-sm"
                placeholder="# Write your post content here

Use markdown formatting for your post content. 

## Subheading

- List item 1
- List item 2

[Link text](https://example.com)"
              ></textarea>
            </div>
            {#if errors.content}
              <p class="mt-2 text-sm text-red-600">{errors.content}</p>
            {/if}
          </div>
          
          <!-- Tags -->
          <div>
            <label for="tags-container" class="block text-sm font-medium text-gray-700">Tags</label>
            <div id="tags-container" class="mt-2 flex flex-wrap gap-2">
              {#each availableTags as tag}
                <button
                  type="button"
                  onclick={() => toggleTag(tag.id)}
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm {post.tags.includes(tag.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}"
                >
                  {tag.name}
                </button>
              {/each}
            </div>
            <input type="hidden" name="tags" value={JSON.stringify(post.tags)} />
          </div>
          
          <!-- Featured -->
          <div class="flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              bind:checked={post.featured}
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="featured" class="ml-2 block text-sm text-gray-900">
              Feature this post on the homepage
            </label>
          </div>
          
          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create Post
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
