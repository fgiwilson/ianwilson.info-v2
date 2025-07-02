<script lang="ts">
  import { enhance } from '$app/forms';
  import { marked } from 'marked';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  
  // Props from server
  const { data } = $props();
  
  // Define types for media items
  interface MediaItem {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    filename: string;
    path: string;
    thumbnailPath: string | null;
    mediumPath: string | null;
    mimetype: string;
    size: number;
    alt: string | null;
  }

  // Form state
  const project = $state({
    id: data.project?.id || '',
    title: data.project?.title || '',
    slug: data.project?.slug || '',
    content: data.project?.content || '',
    description: data.project?.description || '',
    client: data.project?.client || '',
    completionDate: data.project?.completionDate ? new Date(data.project.completionDate).toISOString().split('T')[0] : '',
    technologies: data.project?.technologies || '',
    websiteUrl: data.project?.websiteUrl || '',
    githubUrl: data.project?.githubUrl || '',
    featured: data.project?.featured || false,
    order: data.project?.order || 0,
    categories: data.project?.categories?.map((category: {id: string}) => category.id) || [],
    images: data.project?.images || []
  });
  
  // Preview state
  let showPreview = $state(false);
  const previewContent = $derived(project.content);
  const renderedMarkdown = $derived(marked.parse(previewContent));
  
  // Available categories (would normally come from the server)
  const availableCategories = $state(data.categories || []);
  
  // Media state
  let selectedMediaIds = $state<string[]>(project.images.map((media: MediaItem) => media.id));
  
  // Error state
  const errors = $state({
    title: '',
    slug: '',
    content: '',
    description: '',
    general: ''
  });
  
  // Auto-generate slug from title
  function generateSlug() {
    if (project.title && !project.slug) {
      project.slug = project.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }
  
  // Toggle featured status
  function toggleFeatured() {
    project.featured = !project.featured;
  }
  
  // Toggle category selection
  function toggleCategory(categoryId: string) {
    const index = project.categories.indexOf(categoryId);
    if (index === -1) {
      project.categories = [...project.categories, categoryId];
    } else {
      project.categories = project.categories.filter((id: string) => id !== categoryId);
    }
  }
  
  // Handle media upload completion
  function handleMediaUpload(event: CustomEvent<{media: MediaItem[]}>) {
    const newMedia = event.detail.media;
    project.images = [...project.images, ...newMedia];
    selectedMediaIds = [...selectedMediaIds, ...newMedia.map(m => m.id)];
  }
  
  // Handle media removal
  function handleMediaRemove(event: CustomEvent<{id: string}>) {
    const id = event.detail.id;
    project.images = project.images.filter((m: MediaItem) => m.id !== id);
    selectedMediaIds = selectedMediaIds.filter(mediaId => mediaId !== id);
  }

  // Form submission handler
  const handleEnhance = () => {
    // Reset errors
    errors.title = '';
    errors.slug = '';
    errors.content = '';
    errors.description = '';
    errors.general = '';
    
    // Validate form
    let isValid = true;
    
    if (!project.title) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!project.slug) {
      errors.slug = 'Slug is required';
      isValid = false;
    }
    
    if (!project.content) {
      errors.content = 'Content is required';
      isValid = false;
    }
    
    if (!project.description) {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    if (!isValid) {
      return ({ cancel: true }) as unknown as ReturnType<typeof enhance>;
    }
    
    return (async ({ result }: { result: any }) => {
      if (result.type === 'failure') {
        errors.general = result.data?.message || 'Failed to update project. Please try again.';
      } else if (result.type === 'success') {
        // Show success message and redirect to projects list
        window.location.href = '/admin/projects?updated=true';
      } else if (result.type === 'redirect') {
        // Let the browser handle the redirect
      }
    }) as unknown as ReturnType<typeof enhance>;
  };
</script>

<svelte:head>
  <title>Edit Project | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Edit Project</h1>
    <div class="flex space-x-3">
      <button
        type="button"
        onclick={() => { showPreview = !showPreview }}
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {showPreview ? 'Edit' : 'Preview'}
      </button>
      <a 
        href="/admin/projects" 
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
            <h2 class="text-2xl font-bold text-gray-900">{project.title || 'Untitled Project'}</h2>
            {#if project.description}
              <p class="mt-2 text-gray-600">{project.description}</p>
            {/if}
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Project Details</h3>
            <!-- Rendered markdown content -->
            <div class="p-4 border rounded bg-gray-50 prose prose-sm max-w-none">
              {@html renderedMarkdown}
            </div>
          </div>
        </div>
      {:else}
        <!-- Edit Mode -->
        <form method="POST" use:enhance={handleEnhance as any} class="space-y-6">
          <input type="hidden" name="id" value={project.id} />
          
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              bind:value={project.title}
              onblur={generateSlug}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Project title"
            />
            {#if errors.title}
              <p class="mt-2 text-sm text-red-600">{errors.title}</p>
            {/if}
          </div>
          
          <!-- Slug -->
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                /portfolio/
              </span>
              <input
                type="text"
                name="slug"
                id="slug"
                bind:value={project.slug}
                class="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="project-slug"
              />
            </div>
            {#if errors.slug}
              <p class="mt-2 text-sm text-red-600">{errors.slug}</p>
            {/if}
          </div>
          
          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div class="mt-1">
              <textarea
                id="description"
                name="description"
                rows="3"
                bind:value={project.description}
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Brief description of the project"
              ></textarea>
            </div>
            {#if errors.description}
              <p class="mt-2 text-sm text-red-600">{errors.description}</p>
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
                bind:value={project.content}
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary font-mono text-sm"
                placeholder="# Project Details

Use markdown formatting for your project content.

## Challenge

Describe the project challenge or requirements.

## Solution

Explain how you approached the solution.

## Technologies Used

- Technology 1
- Technology 2
- Technology 3

## Results

Describe the outcomes and results of the project."
              ></textarea>
            </div>
            {#if errors.content}
              <p class="mt-2 text-sm text-red-600">{errors.content}</p>
            {/if}
          </div>
          
          <!-- Categories -->
          <div>
            <label for="categories-container" class="block text-sm font-medium text-gray-700">Categories</label>
            <div id="categories-container" class="mt-2 flex flex-wrap gap-2">
              {#each availableCategories as category}
                <button
                  type="button"
                  onclick={() => toggleCategory(category.id)}
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm {project.categories.includes(category.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}"
                >
                  {category.name}
                </button>
              {/each}
            </div>
            <input type="hidden" name="categories" value={JSON.stringify(project.categories)} />
          </div>
          
          <!-- Order -->
          <div>
            <label for="order" class="block text-sm font-medium text-gray-700">
              Display Order
              <span class="text-gray-500">(lower numbers appear first)</span>
            </label>
            <input
              type="number"
              name="order"
              id="order"
              bind:value={project.order}
              class="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              min="0"
            />
          </div>
          
          <!-- Client -->
          <div>
            <label for="client" class="block text-sm font-medium text-gray-700">
              Client
            </label>
            <input
              type="text"
              name="client"
              id="client"
              bind:value={project.client}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Client name (optional)"
            />
          </div>
          
          <!-- Completion Date -->
          <div>
            <label for="completionDate" class="block text-sm font-medium text-gray-700">
              Completion Date
            </label>
            <input
              type="date"
              name="completionDate"
              id="completionDate"
              bind:value={project.completionDate}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <!-- Technologies -->
          <div>
            <label for="technologies" class="block text-sm font-medium text-gray-700">
              Technologies
              <span class="text-gray-500">(comma separated)</span>
            </label>
            <input
              type="text"
              name="technologies"
              id="technologies"
              bind:value={project.technologies}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="React, Node.js, MongoDB, etc."
            />
          </div>
          
          <!-- Website URL -->
          <div>
            <label for="websiteUrl" class="block text-sm font-medium text-gray-700">
              Website URL
              <span class="text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              name="websiteUrl"
              id="websiteUrl"
              bind:value={project.websiteUrl}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://example.com"
            />
          </div>
          
          <!-- GitHub URL -->
          <div>
            <label for="githubUrl" class="block text-sm font-medium text-gray-700">
              GitHub URL
              <span class="text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              name="githubUrl"
              id="githubUrl"
              bind:value={project.githubUrl}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://github.com/username/repo"
            />
          </div>
          
          <!-- Featured -->
          <div class="flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              bind:checked={project.featured}
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="featured" class="ml-2 block text-sm text-gray-900">
              Feature this project on the homepage
            </label>
          </div>
          
          <!-- Media Section -->
          <div class="mt-6">
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
                          const textBefore = project.content.substring(0, startPos);
                          const textAfter = project.content.substring(endPos);
                          project.content = textBefore + markdownToInsert + textAfter;
                          
                          // Update cursor position after insertion
                          setTimeout(() => {
                            textarea.focus();
                            textarea.selectionStart = startPos + markdownToInsert.length;
                            textarea.selectionEnd = startPos + markdownToInsert.length;
                          }, 0);
                          
                          // Add to project images if not already included
                          if (!project.images.some(img => img.id === media.id)) {
                            project.images = [...project.images, media];
                            selectedMediaIds = [...selectedMediaIds, media.id];
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
            <div>
              <MediaUploader 
                multiple={true} 
                accept="image/*" 
                existingMedia={project.images} 
                on:uploadComplete={handleMediaUpload} 
                on:removeMedia={handleMediaRemove} 
              />
              <input type="hidden" name="mediaIds" value={JSON.stringify(selectedMediaIds)} />
            </div>
          </div>
          
          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Update Project
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
