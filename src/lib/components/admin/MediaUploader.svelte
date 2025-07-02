<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
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
  
  // Props
  const props = $props<{
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    existingMedia?: MediaItem[];
  }>();
  
  // Extract props with defaults
  const multiple = props.multiple ?? false;
  const accept = props.accept ?? 'image/*';
  const maxSize = props.maxSize ?? 5 * 1024 * 1024; // 5MB default
  
  // Make existingMedia mutable so we can update it
  let existingMedia = $state<MediaItem[]>(props.existingMedia ?? []);
  
  // State
  let files = $state<File[]>([]);
  let uploading = $state(false);
  let error = $state('');
  let progress = $state(0);
  let message = $state(''); // Success message state
  
  // Event dispatcher for parent components
  const dispatch = createEventDispatcher();
  
  // Handle file selection
  function handleFileSelect(event: Event): void {
    error = '';
    const target = event.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []);
    
    // Validate files
    const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      error = `File size exceeds the ${maxSize / (1024 * 1024)}MB limit`;
      return;
    }
    
    // Add files to state
    files.push(...selectedFiles);
    
    // Reset input
    target.value = '';
  }
  
  // Remove file from selection
  function removeFile(index: number): void {
    files.splice(index, 1);
  }
  
  // Remove existing media
  function removeExistingMedia(id: string): void {
    // Dispatch event to parent component
    dispatch('removeMedia', { id });
    
    // Also update local state
    existingMedia = existingMedia.filter(item => item.id !== id);
  }
  
  // Upload files
  async function uploadFiles(): Promise<void> {
    if (files.length === 0) {
      console.log('No files to upload');
      return;
    }
    
    console.log(`Starting upload of ${files.length} files`);
    uploading = true;
    progress = 0;
    error = '';
    
    // Store the number of files for UI updates
    const totalFiles = files.length;
    
    try {
      // Upload each file individually and collect results
      const uploadedMedia: MediaItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file); // Use 'file' key for consistency
        formData.append('alt', file.name); // Default alt text to filename
        
        // Update progress based on current file (add 1 to i since i is 0-based)
        progress = Math.round(((i + 1) / files.length) * 100);
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const result = await response.json();
        if (result.success && result.media) {
          uploadedMedia.push(result.media);
        }
      }
      
      // Set progress to 100% when complete
      progress = 100;
      
      // Dispatch success event with uploaded media
      dispatch('uploadComplete', { media: uploadedMedia });
      
      // Clear files
      files = [];
      
      // Update existing media with newly uploaded files
      if (uploadedMedia.length > 0) {
        // Add new media to existing media if not already present
        for (const media of uploadedMedia) {
          if (!existingMedia.some(m => m.id === media.id)) {
            existingMedia = [...existingMedia, media];
          }
        }
      }
      
      // Show success message
      const fileText = uploadedMedia.length === 1 ? 'file' : 'files';
      message = `Successfully uploaded ${uploadedMedia.length} ${fileText}`;
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        message = '';
      }, 5000);
    } catch (err: unknown) {
      const error_message = err instanceof Error ? err.message : 'Upload failed';
      error = error_message;
    } finally {
      uploading = false;
    }
  }
  
  // Format file size for display
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium text-gray-900">Media</h3>
    <label 
      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
    >
      Add Files
      <input 
        type="file" 
        class="hidden" 
        {accept} 
        {multiple} 
        onchange={handleFileSelect}
      />
    </label>
  </div>
  
  {#if error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if message}
    <div class="rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{message}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Existing media -->
  {#if existingMedia && existingMedia.length > 0}
    <div class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Current Media</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {#each existingMedia as media}
          <div class="relative group">
            <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-md overflow-hidden">
              {#if media.mimetype.startsWith('image/')}
                <img 
                  src={media.path.startsWith('/') ? media.path : `/${media.path}`} 
                  alt={media.alt || media.filename} 
                  class="object-cover w-full h-full"
                  onerror={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log('Image failed to load:', img.src);
                    // Optionally set a fallback image
                    // img.src = '/images/placeholder.jpg';
                  }}
                />
              {:else}
                <div class="flex items-center justify-center h-full bg-gray-100">
                  <span class="text-gray-500" data-feather="file"></span>
                </div>
              {/if}
            </div>
            <button 
              type="button"
              class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onclick={() => removeExistingMedia(media.id)}
              aria-label="Remove media"
            >
              <span class="text-sm" data-feather="x"></span>
            </button>
            <div class="mt-1 text-xs text-gray-500 truncate">{media.filename}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Selected files -->
  {#if files.length > 0}
    <div class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
      <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md">
        {#each files as file, i}
          <li class="px-4 py-3 flex items-center justify-between text-sm">
            <div class="flex items-center">
              {#if file.type.startsWith('image/')}
                <div class="w-10 h-10 mr-3 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    class="w-full h-full object-cover"
                  />
                </div>
              {:else}
                <span class="mr-3 text-gray-400" data-feather="file"></span>
              {/if}
              <div>
                <p class="font-medium text-gray-900 truncate">{file.name}</p>
                <p class="text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button 
              type="button" 
              class="text-red-600 hover:text-red-900"
              onclick={() => removeFile(i)}
              aria-label="Remove file"
            >
              <span data-feather="trash-2"></span>
            </button>
          </li>
        {/each}
      </ul>
      
      {#if uploading}
        <div class="mt-4">
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block text-primary">
                  Uploading...
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-primary">
                  {progress}%
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
              <div 
                style="width:{progress}%" 
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              ></div>
            </div>
          </div>
        </div>
      {:else}
        <div class="mt-4 flex justify-end">
          <button
            type="button"
            onclick={uploadFiles}
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Upload Files
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
