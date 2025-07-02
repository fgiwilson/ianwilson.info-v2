<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  
  // Props from server
  const { data } = $props();
  
  // Check URL parameters for success message
  const urlParams = $state(page.url.searchParams);
  const showSuccessMessage = $derived(urlParams.get('created') === 'true' || urlParams.get('updated') === 'true');
  const successMessage = $derived(
    urlParams.get('created') === 'true' 
      ? 'Blog post created successfully!' 
      : 'Blog post updated successfully!'
  );
  
  // Auto-hide success message after 5 seconds
  onMount(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        // Remove the query parameter without refreshing the page
        const url = new URL(window.location.href);
        url.searchParams.delete('created');
        url.searchParams.delete('updated');
        window.history.replaceState({}, '', url);
      }, 5000);
    }
  });
  
  // Form state
  const post = $state({
    id: data.post?.id || '',
    title: data.post?.title || '',
    slug: data.post?.slug || '',
    content: data.post?.content || '',
    excerpt: data.post?.excerpt || '',
    featured: data.post?.featured || false,
    published: data.post?.publishedAt !== null,
    tags: data.post?.tags?.map((tag: {id: string}) => tag.id) || [],
    coverImage: data.post?.coverImage || null,
    images: data.post?.images || []
  });
  
  // Media state
  const selectedMedia = $state<string[]>([]);
  let mediaLibrary = $state<any[]>(data.mediaLibrary || []);
  
  // Function to update media library
  function updateMediaLibrary(newMedia: any | any[]) {
    if (Array.isArray(newMedia)) {
      // Filter out any duplicates by ID
      const newItems = newMedia.filter(media => !mediaLibrary.some(existing => existing.id === media.id));
      if (newItems.length > 0) {
        mediaLibrary = [...mediaLibrary, ...newItems];
        console.log('Media library updated with', newItems.length, 'new items');
      }
    } else if (newMedia && !mediaLibrary.some(existing => existing.id === newMedia.id)) {
      mediaLibrary = [...mediaLibrary, newMedia];
      console.log('Media library updated with 1 new item');
    }
  }
  
  // Preview state
  let showPreview = $state(false);
  const previewContent = $derived(post.content);
  const renderedMarkdown = $derived(marked.parse(previewContent));
  
  // Available tags (would normally come from the server)
  const availableTags = $state(data.tags || []);
  
  // Media interface
  interface Media {
    id: string;
    filename: string;
    path: string;
    thumbnailPath: string | null;
    mediumPath: string | null;
    mimetype: string;
    size: number;
    alt: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // Media functions
  function insertMedia(media: Media): void {
    // Insert markdown for the media at cursor position or at the end
    const textarea = document.getElementById('content') as HTMLTextAreaElement | null;
    const isImage = media.mimetype.startsWith('image/');
    
    let markdownToInsert = '';
    if (isImage) {
      markdownToInsert = `![${media.alt || media.filename}](${media.path})`;
    } else {
      markdownToInsert = `[${media.alt || media.filename}](${media.path})`;
    }
    
    // Insert at cursor position if available, otherwise append
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const currentContent = post.content;
      
      post.content = currentContent.substring(0, startPos) + 
                    markdownToInsert + 
                    currentContent.substring(endPos);
      
      // Set cursor position after the inserted markdown
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = startPos + markdownToInsert.length;
        textarea.selectionEnd = startPos + markdownToInsert.length;
      }, 0);
    } else {
      // Append to the end if textarea not found
      post.content += '\n\n' + markdownToInsert;
    }
  }
  
  // Handle media upload completion
  function handleMediaUpload(event: CustomEvent): void {
    const uploadedMedia = event.detail.media as Media[];
    if (uploadedMedia && uploadedMedia.length > 0) {
      // Insert the first uploaded media into the content
      insertMedia(uploadedMedia[0]);
      
      // Update the media library with all uploaded media
      updateMediaLibrary(uploadedMedia);
    }
  }
  
  // Set cover image
  function setCoverImage(media: Media): void {
    post.coverImage = media;
  }
  
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
    if (post.title && !post.slug) {
      post.slug = post.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }
  
  // Toggle featured status
  function toggleFeatured(id: string) {
    post.featured = !post.featured;
  }
  
  // Toggle tag selection
  function toggleTag(tagId: string) {
    const index = post.tags.indexOf(tagId);
    if (index === -1) {
      post.tags = [...post.tags, tagId];
    } else {
      post.tags = post.tags.filter((id: string) => id !== tagId);
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
    
    // Add media relationships to form data
    if (post.coverImage) {
      formData.set('coverImageId', post.coverImage.id);
    }
    
    // Add image IDs as JSON string
    if (post.images && post.images.length > 0) {
      const imageIds = post.images.map((img: any) => img.id);
      formData.set('imageIds', JSON.stringify(imageIds));
    } else {
      formData.set('imageIds', '[]');
    }
    
    return async ({ result }: { result: { type: string; data?: { message?: string, success?: boolean } } }) => {
      if (result.type === 'failure') {
        errors.general = result.data?.message || 'Failed to update post. Please try again.';
      } else if (result.type === 'success' && result.data?.success) {
        // Show success message by reloading the page with a success parameter
        window.location.href = `${window.location.pathname}?updated=true`;
      }
    };
  };
</script>

<svelte:head>
  <title>Edit Blog Post | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Edit Blog Post</h1>
    <div class="flex space-x-3">
      <button
        type="button"
        onclick={() => { showPreview = !showPreview }}
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
  
  {#if showSuccessMessage}
    <div class="rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Success</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>{successMessage}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
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
            <!-- Rendered markdown content -->
            <div class="p-4 border rounded bg-gray-50 prose prose-sm max-w-none">
              {@html renderedMarkdown}
            </div>
          </div>
        </div>
      {:else}
        <!-- Edit Mode -->
        <form method="POST" use:enhance={handleEnhance as any} class="space-y-6">
          <input type="hidden" name="id" value={post.id} />
          
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
          <div class="mt-4">
            <label for="content" class="block text-sm font-medium text-gray-700">Content (Markdown)</label>
            <div class="mt-1">
              <textarea
                id="content"
                name="content"
                rows="20"
                class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md font-mono"
                bind:value={post.content}
              ></textarea>
            </div>
            {#if errors.content}
              <p class="mt-2 text-sm text-red-600">{errors.content}</p>
            {/if}
          </div>
          
          <!-- Media Management -->
          <div class="mt-6 border-t border-gray-200 pt-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Media</h3>
            
            <!-- Media Gallery for Quick Insert -->
            {#if data.mediaLibrary && data.mediaLibrary.length > 0}
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Insert Media</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {#each data.mediaLibrary as media}
                    {#if media.mimetype.startsWith('image/')}
                      <div 
                        role="button"
                        tabindex="0"
                        class="relative group aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden border border-gray-200 hover:border-primary transition-colors cursor-pointer"
                        onclick={(e) => {
                          // Insert media at cursor position
                          const textarea = document.getElementById('content') as HTMLTextAreaElement;
                          if (!textarea) return;
                          
                          // Get cursor position
                          const startPos = textarea.selectionStart;
                          const endPos = textarea.selectionEnd;
                          
                          // Prepare markdown for insertion
                          let markdownToInsert = '';
                          
                          // Format based on media type
                          if (media.mimetype.startsWith('image/')) {
                            // Insert as image
                            markdownToInsert = `![${media.alt || media.filename}](${media.path})`;
                          } else {
                            // Insert as link
                            markdownToInsert = `[${media.filename}](${media.path})`;
                          }
                          
                          // Insert markdown at cursor position
                          const textBefore = post.content.substring(0, startPos);
                          const textAfter = post.content.substring(endPos);
                          post.content = textBefore + markdownToInsert + textAfter;
                          
                          // Update cursor position after insertion
                          setTimeout(() => {
                            textarea.focus();
                            textarea.selectionStart = startPos + markdownToInsert.length;
                            textarea.selectionEnd = startPos + markdownToInsert.length;
                          }, 0);
                          
                          // Add to post images if not already included
                          if (!post.images.some(img => img.id === media.id)) {
                            post.images = [...post.images, media];
                          }
                        }}
                        onkeypress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        aria-label={`Insert image: ${media.filename}`}
                      >
                        <!-- Debug info -->
                        {#if import.meta.env.DEV}
                          <div class="w-full h-full relative">
                            <img 
                              src={media.path.startsWith('/') ? media.path : `/${media.path}`} 
                              alt={media.alt || media.filename} 
                              class="object-cover w-full h-full"
                              onerror={(e) => {
                                const img = e.target as HTMLImageElement;
                                console.error('Image failed to load:', img.src);
                                // Set a fallback image
                                img.src = '/images/placeholder-image.png';
                                // Show error overlay
                                const parent = img.closest('.relative');
                                if (parent) {
                                  const errorOverlay = document.createElement('div');
                                  errorOverlay.className = 'absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center';
                                  errorOverlay.innerHTML = `<span class="text-white text-xs p-1">Error: ${media.path}</span>`;
                                  parent.appendChild(errorOverlay);
                                }
                              }}
                            />
                            <div 
                              class="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-opacity"
                              role="button"
                              tabindex="0"
                              aria-label={`View details for ${media.filename}`}
                              onclick={() => console.log('Media item:', media)}
                              onkeydown={(e) => e.key === 'Enter' && console.log('Media item:', media)}
                            ></div>
                          </div>
                        {:else}
                          <img 
                            src={media.path.startsWith('/') ? media.path : `/${media.path}`} 
                            alt={media.alt || media.filename} 
                            class="object-cover w-full h-full"
                            onerror={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/images/placeholder-image.png';
                            }}
                          />
                        {/if}
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-opacity">
                          <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity">Insert</span>
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
            
            <!-- Media Uploader -->
            <MediaUploader 
              multiple={true}
              accept="image/*"
              existingMedia={post.images || []}
              on:uploadComplete={(e) => {
                // Add uploaded media to post images and media library
                const uploadedMedia = e.detail.media;
                if (uploadedMedia) {
                  // Handle single media item
                  if (!Array.isArray(uploadedMedia)) {
                    if (post.images) {
                      post.images = [...post.images, uploadedMedia];
                    }
                    // Also add to media library for immediate use
                    updateMediaLibrary(uploadedMedia);
                  } 
                  // Handle array of media items
                  else {
                    if (post.images) {
                      post.images = [...post.images, ...uploadedMedia];
                    }
                    // Also add to media library for immediate use
                    updateMediaLibrary(uploadedMedia);
                    
                    // Force UI refresh by triggering a state change
                    mediaLibrary = [...mediaLibrary];
                  }
                }
              }}
              on:removeMedia={(e) => {
                // Handle removing media
                const mediaId = e.detail.id;
                if (post.images) {
                  post.images = post.images.filter(img => img.id !== mediaId);
                }
              }}
            />
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
          
          <!-- Published Status -->
          <div class="flex items-center mt-4">
            <input
              id="published"
              name="published"
              type="checkbox"
              bind:checked={post.published}
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="published" class="ml-2 block text-sm text-gray-900">
              {post.published ? 'Published' : 'Draft'} - {post.published ? 'Post is visible to visitors' : 'Post is only visible to admins'}
            </label>
          </div>
          
          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Update Post
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
