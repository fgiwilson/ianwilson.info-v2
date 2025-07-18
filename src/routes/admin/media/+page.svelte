<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';

  interface MediaItem {
    id: string;
    filename: string;
    path: string;
    thumbnailPath?: string;
    mediumPath?: string;
    mimetype: string;
    size: number;
    alt?: string;
    createdAt: string | Date;
  }

  interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }

  interface PageData {
    media: MediaItem[];
    pagination: Pagination;
  }

  export let data: PageData;

  let media: MediaItem[] = data.media || [];
  let pagination: Pagination = data.pagination || { 
    page: 1, 
    limit: 12, 
    totalItems: 0, 
    totalPages: 0, 
    hasNextPage: false, 
    hasPrevPage: false 
  };
  let searchTerm = $page.url.searchParams.get('search') || '';
  let filterType = $page.url.searchParams.get('type') || 'all';
  let message = '';
  let showSuccessMessage = false;
  let showErrorMessage = false;

  // Format file size to human-readable format
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format date to human-readable format
  function formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Navigate with query parameters
  async function navigateWithParams(params: Record<string, string>): Promise<void> {
    const url = new URL($page.url);
    
    // Update or add new parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    // Navigate to the new URL and ensure the page is reloaded
    await goto(url.toString(), { invalidateAll: true });
    
    // Update local state with the new URL parameters
    if (params.page) {
      pagination = { ...pagination, page: parseInt(params.page) };
    }
    if (params.search !== undefined) {
      searchTerm = params.search;
    }
    if (params.type !== undefined) {
      filterType = params.type;
    }
  }

  // Handle media upload completion
  function handleMediaUpload(event: CustomEvent): void {
    const uploadedMedia = event.detail;
    if (uploadedMedia && uploadedMedia.length > 0) {
      message = `Successfully uploaded ${uploadedMedia.length} file(s)`;
      showSuccessMessage = true;
      setTimeout(() => {
        showSuccessMessage = false;
      }, 3000);
      
      // Refresh the page to show new uploads
      goto($page.url.pathname, { replaceState: true });
    }
  }

  // Handle media deletion
  function handleDelete({ form, data, action, cancel }: any) {
    return async ({ result, update }: any) => {
      if (result.type === 'success') {
        message = 'Media deleted successfully';
        showSuccessMessage = true;
        setTimeout(() => {
          showSuccessMessage = false;
        }, 3000);
        
        // Refresh the page to update the media list
        goto($page.url.pathname + $page.url.search, { replaceState: true });
      } else {
        message = result.data?.message || 'Failed to delete media';
        showErrorMessage = true;
        setTimeout(() => {
          showErrorMessage = false;
        }, 3000);
      }
    };
  }

  // Apply search filter
  function applySearch(): void {
    navigateWithParams({ search: searchTerm, page: '1' });
  }

  // Apply type filter
  function applyFilter(type: string): void {
    navigateWithParams({ type, page: '1' });
  }

  // Clear all filters
  function clearFilters(): void {
    searchTerm = '';
    filterType = 'all';
    navigateWithParams({ search: '', type: 'all', page: '1' });
  }

  // Format file size for display (alternative implementation)
  function formatFileSizeAlt(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Legacy code - removed duplicate handleDelete function

  // Handle search form submission
  function handleSearchSubmit(event: SubmitEvent): void {
    event.preventDefault();
    applySearch();
  }
  
  // Handle filter change
  function handleFilterChange(event: Event): void {
    // Ensure we're using the latest value from the select element
    const select = event.target as HTMLSelectElement;
    filterType = select.value;
    applyFilter(filterType);
  }

  // Add global function for form submission handling
  function handleDeleteSubmit(form: HTMLFormElement): void {
    fetch(form.action, { 
      method: 'POST', 
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        window.location.href = window.location.pathname + '?success=true&message=Media+deleted+successfully';
      } else {
        window.location.href = window.location.pathname + '?error=true&message=Failed+to+delete+media';
      }
    });
  }
</script>

<svelte:head>
  <title>Media Library | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Media Library</h1>
  </div>
  
  <!-- Success/Error Messages -->
  {#if showSuccessMessage}
    <div class="rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{message}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showErrorMessage}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{message}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Media Uploader -->
  <div class="bg-white shadow overflow-hidden rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Upload New Media</h2>
      <MediaUploader 
        multiple={true}
        accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        on:uploadComplete={handleMediaUpload}
      />
    </div>
  </div>
  
  <!-- Media Library -->
  <div class="bg-white shadow overflow-hidden rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900">Media Library</h2>
        
        <div class="mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <!-- Search -->
          <form class="flex w-full sm:w-auto" onsubmit={handleSearchSubmit}>
            <div class="relative rounded-md shadow-sm flex-grow">
              <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search media..."
                class="block w-full px-4 py-2 text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              class="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Search media"
            >Search</button>
          </form>
          
          <!-- Filter -->
          <select
            bind:value={filterType}
            onchange={handleFilterChange}
            class="block w-full px-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>
          
          <!-- Clear filters -->
          <button
            type="button"
            onclick={clearFilters}
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Clear filters"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {#if media.length === 0}
        <div class="text-center py-8">
          {#if pagination.totalItems === 0}
            <p class="text-gray-500">No media files have been uploaded yet.</p>
          {:else}
            <p class="text-gray-500">No media files match your search criteria.</p>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {#each media as item}
            <div class="relative group border border-gray-200 rounded-md overflow-hidden">
              <div class="aspect-w-1 aspect-h-1 bg-gray-100">
                {#if item.mimetype.startsWith('image/')}
                  <img 
                    src={item.thumbnailPath || item.mediumPath || item.path}
                    alt={item.alt || item.filename}
                    class="object-cover w-full h-full"
                    loading="lazy"
                    onerror={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null; 
                      img.src = '/images/placeholder-image.png';
                    }}
                    data-original={item.path}
                  />
                {:else}
                  <div class="flex items-center justify-center h-full">
                    <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                {/if}
              </div>
              
              <!-- Overlay with actions -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div class="flex space-x-2">
                  <a 
                    href={item.path.startsWith('http') ? item.path : (item.path.startsWith('/') ? item.path : `/${item.path}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-white p-2 rounded-full hover:bg-gray-700 bg-gray-800"
                    aria-label="View media details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  
                  <form 
                    method="POST" 
                    action="?/delete" 
                    onsubmit={(e: SubmitEvent) => { e.preventDefault(); handleDeleteSubmit(e.currentTarget as HTMLFormElement); }}
                    class="inline-block"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <button 
                      type="submit" 
                      class="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                      aria-label="Delete media"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
              
              <!-- File info -->
              <div class="p-2">
                <p class="text-sm font-medium text-gray-900 truncate" title={item.filename}>{item.filename}</p>
                <p class="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                <p class="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Pagination Controls -->
        {#if pagination.totalPages > 1}
          <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
            <div class="flex flex-1 justify-between sm:hidden">
              <button 
                type="button" 
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 {!pagination.hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}" 
                disabled={!pagination.hasPrevPage}
                onclick={() => navigateWithParams({ page: String(pagination.page - 1) })}
              >
                Previous
              </button>
              <button 
                type="button" 
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 {!pagination.hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}" 
                disabled={!pagination.hasNextPage}
                onclick={() => navigateWithParams({ page: String(pagination.page + 1) })}
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalItems)}</span> of{' '}
                  <span class="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <!-- Previous Page -->
                  <button
                    type="button"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 {!pagination.hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}"
                    disabled={!pagination.hasPrevPage}
                    onclick={() => navigateWithParams({ page: String(pagination.page - 1) })}
                    aria-label="Previous page"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <!-- Page Numbers -->
                  {#each Array(pagination.totalPages) as _, i}
                    {#if i + 1 === pagination.page || i + 1 === 1 || i + 1 === pagination.totalPages || (i + 1 >= pagination.page - 1 && i + 1 <= pagination.page + 1)}
                      <button
                        type="button"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-semibold {i + 1 === pagination.page ? 'bg-primary text-white focus:z-20 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}"
                        onclick={() => navigateWithParams({ page: String(i + 1) })}
                        aria-current={i + 1 === pagination.page ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    {:else if (i === 1 && pagination.page > 3) || (i === pagination.totalPages - 2 && pagination.page < pagination.totalPages - 2)}
                      <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        ...
                      </span>
                    {/if}
                  {/each}
                  
                  <!-- Next Page -->
                  <button
                    type="button"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 {!pagination.hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}"
                    disabled={!pagination.hasNextPage}
                    onclick={() => navigateWithParams({ page: String(pagination.page + 1) })}
                    aria-label="Next page"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
