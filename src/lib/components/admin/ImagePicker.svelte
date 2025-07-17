<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  
  // Define props
  const props = $props<{
    selectedImage: any | null;
    onSelect: (media: any) => void;
    title?: string;
    buttonText?: string;
    required?: boolean;
    id?: string;
  }>();
  
  // State
  let showMediaSelector = $state(false);
  let mediaItems = $state<any[]>([]);
  let isLoading = $state(true);
  let error = $state('');
  let searchQuery = $state('');
  
  // Derived values
  const title = $derived(props.title || 'Select Image');
  const buttonText = $derived(props.buttonText || 'Choose Image');
  const required = $derived(props.required || false);
  const selectedImage = $derived(props.selectedImage);
  const id = $derived(props.id || `image-picker-${Math.random().toString(36).substring(2, 9)}`);
  
  // Filter media items based on search query
  const filteredMediaItems = $derived(
    searchQuery 
      ? mediaItems.filter(item => 
          item.filename.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : mediaItems
  );
  
  // Load media items on mount
  onMount(async () => {
    await loadMediaItems();
  });
  
  // Load media items from the server
  async function loadMediaItems() {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch('/api/media');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      mediaItems = data.media || [];
    } catch (err) {
      console.error('Failed to load media items:', err);
      error = 'Failed to load media items. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  // Handle image selection
  function selectImage(media: any) {
    props.onSelect(media);
    showMediaSelector = false;
  }
  
  // Clear selected image
  function clearSelection() {
    props.onSelect(null);
  }
  
  // Get image URL with proper path handling
  function getImageUrl(path: string): string {
    if (!path) return '';
    
    // Handle S3 URLs (already absolute)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Handle local paths (make them relative to the site root)
    return path.startsWith('/') ? path : `/${path}`;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <label for="image-picker-{id}" class="block text-sm font-medium text-gray-700">
      {title} {required ? '*' : ''}
    </label>
    <button
      type="button"
      onclick={() => showMediaSelector = !showMediaSelector}
      class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      {showMediaSelector ? 'Close' : buttonText}
    </button>
  </div>
  
  {#if selectedImage}
    <div class="relative border rounded-md overflow-hidden bg-gray-50">
      <img 
        src={getImageUrl(selectedImage.thumbnailPath || selectedImage.path)} 
        alt={selectedImage.alt || selectedImage.filename} 
        class="w-full h-48 object-cover"
      />
      <div class="absolute top-2 right-2">
        <button
          type="button"
          onclick={clearSelection}
          class="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
          title="Remove image"
          aria-label="Remove selected image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="p-2 bg-white border-t">
        <p class="text-sm font-medium truncate">{selectedImage.filename}</p>
      </div>
    </div>
  {/if}
  
  {#if showMediaSelector}
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium">Media Library</h3>
          <button
            type="button"
            onclick={() => showMediaSelector = false}
            class="text-gray-400 hover:text-gray-500"
            aria-label="Close media library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Search and controls -->
        <div class="px-6 py-3 border-b">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <input
                type="text"
                placeholder="Search media..."
                bind:value={searchQuery}
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="button"
              onclick={loadMediaItems}
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <!-- Media grid -->
        <div class="flex-1 overflow-y-auto p-6">
          {#if isLoading}
            <div class="flex items-center justify-center h-40">
              <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          {:else if error}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          {:else if filteredMediaItems.length === 0}
            <div class="text-center py-8 text-gray-500">
              {searchQuery ? 'No media items match your search' : 'No media items found'}
            </div>
          {:else}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {#each filteredMediaItems as media}
                <div 
                  class="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-gray-50"
                  onclick={() => selectImage(media)}
                  onkeydown={(e) => e.key === 'Enter' && selectImage(media)}
                  role="button"
                  tabindex="0"
                  aria-label={`Select image: ${media.filename}`}
                >
                  <div class="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={getImageUrl(media.thumbnailPath || media.path)} 
                      alt={media.alt || media.filename}
                      class="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div class="p-2 bg-white border-t">
                    <p class="text-xs font-medium truncate">{media.filename}</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-end">
          <button
            type="button"
            onclick={() => showMediaSelector = false}
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
