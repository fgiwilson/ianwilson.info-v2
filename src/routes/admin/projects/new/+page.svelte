<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  
  // Define project state interface
  interface ProjectState {
    title: string;
    slug: string;
    content: string;
    description: string;
    featured: boolean;
    order: number;
    categories: string[];
    mediaIds: string[];
  }
  
  // Form state
  const project = $state<ProjectState>({
    title: '',
    slug: '',
    content: '',
    description: '',
    featured: false,
    order: 0,
    categories: [],
    mediaIds: []
  });
  
  // Preview state
  let showPreview = $state(false);
  const previewContent = $derived(project.content);
  
  // Available categories (would normally come from the server)
  interface Category {
    id: string;
    name: string;
  }
  
  const availableCategories = $state<Category[]>([]);
  
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
    if (project.title) {
      project.slug = project.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }
  
  // Mock data loading
  onMount(() => {
    // Simulate loading categories
    setTimeout(() => {
      availableCategories.push(
        { id: '1', name: 'Web Development' },
        { id: '2', name: 'UI/UX Design' },
        { id: '3', name: 'Mobile App' },
        { id: '4', name: 'E-Commerce' },
        { id: '5', name: 'SaaS' },
        { id: '6', name: 'Enterprise' }
      );
    }, 300);
  });
  
  // Toggle category selection
  function toggleCategory(categoryId: string) {
    const index = project.categories.indexOf(categoryId);
    if (index === -1) {
      project.categories = [...project.categories, categoryId];
    } else {
      project.categories = project.categories.filter(id => id !== categoryId);
    }
  }
  
  // Define interface for media item to match MediaUploader component
  interface MediaItem {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    alt: string | null;
  }
  
  // Handle media upload completion
  function handleMediaUpload(event: CustomEvent): void {
    const { media } = event.detail;
    // Add new media IDs to the project
    project.mediaIds = [...project.mediaIds, ...media.map((item: MediaItem) => item.id)];
  }
  
  // Handle media removal
  function handleMediaRemove(event: CustomEvent): void {
    const { id } = event.detail;
    project.mediaIds = project.mediaIds.filter(mediaId => mediaId !== id);
  }
  
  // Form submission handler
  const handleEnhance = ({ formData }: { formData: FormData }) => {
    // Reset errors
    errors.title = '';
    errors.slug = '';
    errors.content = '';
    errors.description = '';
    errors.general = '';
    
    // Validate form
    let isValid = true;
    
    const formTitle = formData.get('title');
    const formSlug = formData.get('slug');
    const formDescription = formData.get('description');
    const formContent = formData.get('content');
    
    if (!formTitle) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formSlug) {
      errors.slug = 'Slug is required';
      isValid = false;
    }
    
    if (!formDescription) {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    if (!formContent) {
      errors.content = 'Content is required';
      isValid = false;
    }
    
    if (!isValid) {
      return { cancel: true };
    }
    
    return async ({ result, update }: { result: { type: string; data?: { message?: string, projectId?: string } }; update: () => void }) => {
      if (result.type === 'failure') {
        errors.general = result.data?.message || 'Failed to create project. Please try again.';
      } else if (result.type === 'success' && result.data?.projectId) {
        // Redirect to edit page with the new project ID
        window.location.href = `/admin/projects/${result.data.projectId}/edit?created=true`;
      } else if (result.type === 'redirect') {
        // Let the browser handle the redirect
        return;
      }
    };
  }
</script>

<svelte:head>
  <title>New Project | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">New Project</h1>
    <div class="flex space-x-3">
      <button
        type="button"
        onclick={() => showPreview = !showPreview}
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
          
          <!-- Media Upload -->
          <div class="mt-6 border-t border-gray-200 pt-6">
            <MediaUploader 
              multiple={true} 
              accept="image/*"
              on:uploadComplete={handleMediaUpload}
              on:removeMedia={handleMediaRemove}
            />
            
            <!-- Hidden input for media IDs -->
            <input type="hidden" name="mediaIds" value={JSON.stringify(project.mediaIds)} />
          </div>
          
          <!-- Submit -->
          <div class="flex justify-end mt-6">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create Project
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
