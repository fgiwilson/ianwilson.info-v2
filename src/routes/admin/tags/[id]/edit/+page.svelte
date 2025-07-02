<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  
  // Props from server
  const { data } = $props();
  
  // Success message state
  let successMessage = $state('');
  let showSuccess = $state(false);
  
  // Auto-hide success message after delay
  function showSuccessMessage(message: string) {
    successMessage = message;
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 3000);
  }
  
  // Form submission handler
  const handleSubmit: SubmitFunction = () => {
    return async ({ result }) => {
      const typedResult = result.type === 'success' 
        ? { success: true } 
        : { success: false, message: result.type === 'failure' && result.data ? result.data.message : 'An error occurred' };
      
      if (typedResult.success) {
        showSuccessMessage('Tag updated successfully');
      } else {
        // Handle error
        console.error(typedResult.message);
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Edit Tag</h1>
    <a href="/admin/tags" class="text-primary hover:underline">Back to Tags</a>
  </div>
  
  {#if showSuccess}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <span>{successMessage}</span>
    </div>
  {/if}
  
  <div class="bg-white rounded-lg shadow-md p-6">
    {#if data.tag}
      <form method="POST" action="?/update" use:enhance={handleSubmit}>
        <input type="hidden" name="id" value={data.tag.id} />
        
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={data.tag.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md" 
            required
          />
        </div>
        
        <div class="mb-4">
          <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug (URL-friendly name)</label>
          <input 
            type="text" 
            id="slug" 
            name="slug" 
            value={data.tag.slug}
            class="w-full px-3 py-2 border border-gray-300 rounded-md" 
            required
          />
          <p class="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
        </div>
        

        
        <div class="flex items-center space-x-4">
          <button 
            type="submit" 
            class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Update Tag
          </button>
          
          <a 
            href="/admin/tags" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    {:else}
      <p class="text-red-500">Tag not found</p>
      <a href="/admin/tags" class="text-primary hover:underline block mt-4">Return to Tags</a>
    {/if}
  </div>
</div>
