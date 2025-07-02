<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import MediaUploader from '$lib/components/admin/MediaUploader.svelte';
  
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
  
  // Props from server
  const { data } = $props();
  
  // Media state
  let media = $state<Media[]>(data.media || []);
  
  // Check URL parameters for success/error messages
  const urlParams = $state(page.url.searchParams);
  const showSuccessMessage = $derived(urlParams.get('success') === 'true');
  const showErrorMessage = $derived(urlParams.get('error') === 'true');
  const message = $derived(urlParams.get('message') || '');
  
  // Auto-hide messages after 5 seconds
  onMount(() => {
    if (showSuccessMessage || showErrorMessage) {
      setTimeout(() => {
        // Remove the query parameter without refreshing the page
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        url.searchParams.delete('error');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url);
      }, 5000);
    }
  });
  
  // Filter state
  let searchTerm = $state('');
  let filterType = $state('all');
  
  // Computed filtered media
  const filteredMediaItems = $derived((() => {
    return [...media]
      .filter((item: Media) => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.alt && item.alt.toLowerCase().includes(searchTerm.toLowerCase()));
          
        // Filter by type
        const matchesType = filterType === 'all' || 
          (filterType === 'image' && item.mimetype.startsWith('image/')) ||
          (filterType === 'document' && !item.mimetype.startsWith('image/'));
          
        return matchesSearch && matchesType;
      })
      .sort((a: Media, b: Media) => {
        // Sort by date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  })());
  
  // Handle media upload completion
  function handleMediaUpload(event: CustomEvent): void {
    const uploadedMedia = event.detail.media;
    if (uploadedMedia) {
      if (Array.isArray(uploadedMedia)) {
        media = [...uploadedMedia, ...media];
      } else {
        media = [uploadedMedia, ...media];
      }
      
      // Show success message
      const url = new URL(window.location.href);
      url.searchParams.set('success', 'true');
      url.searchParams.set('message', 'Media uploaded successfully');
      window.history.replaceState({}, '', url);
    }
  }
  
  // Format file size for display
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }
  
  // Handle delete form submission
  function handleDelete({ form, data, action, cancel }: { form: HTMLFormElement; data: FormData; action: URL; cancel: () => void }) {
    return async ({ result }: { result: { type: string } }) => {
      if (result.type === 'success') {
        // Remove the deleted item from the media array
        const deletedId = form.get('id') as string;
        media = media.filter((item: Media) => item.id !== deletedId);
        
        // Show success message
        const url = new URL(window.location.href);
        url.searchParams.set('success', 'true');
        url.searchParams.set('message', 'Media deleted successfully');
        window.history.replaceState({}, '', url);
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('success');
          url.searchParams.delete('message');
          window.history.replaceState({}, '', url);
        }, 5000);
      }
    };
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
          <div class="relative rounded-md shadow-sm">
            <input
              type="text"
              bind:value={searchTerm}
              placeholder="Search media..."
              class="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Filter -->
          <select
            bind:value={filterType}
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>
      
      {#if filteredMediaItems.length === 0}
        <div class="text-center py-8">
          {#if media.length === 0}
            <p class="text-gray-500">No media files have been uploaded yet.</p>
          {:else}
            <p class="text-gray-500">No media files match your search criteria.</p>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {#each filteredMediaItems as item}
            <div class="relative group border border-gray-200 rounded-md overflow-hidden">
              <div class="aspect-w-1 aspect-h-1 bg-gray-100">
                {#if item.mimetype.startsWith('image/')}
                  <img 
                    src={item.thumbnailPath || item.mediumPath || item.path}
                    alt={item.alt || item.filename}
                    class="object-cover w-full h-full"
                    loading="lazy"
                    onerror={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.log('Image failed to load:', img.src);
                      // Try fallback to original path if thumbnail fails
                      if (img.src !== item.path) {
                        console.log('Trying fallback to original path');
                        img.src = item.path;
                      } else {
                        // If original also fails, use placeholder
                        img.src = '/images/placeholder-image.png';
                      }
                    }}
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
                    class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
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
                    use:enhance={handleDelete as any}
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
                <p class="text-xs text-gray-500">{formatDate(item.createdAt.toString())}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
