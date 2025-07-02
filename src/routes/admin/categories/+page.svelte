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
    return async ({ result, formElement }) => {
      const typedResult = result.type === 'success' 
        ? { success: true } 
        : { success: false, message: result.type === 'failure' && result.data ? result.data.message : 'An error occurred' };
      
      if (typedResult.success) {
        showSuccessMessage('Category added successfully');
        formElement.reset();
      } else {
        // Handle error
        console.error(typedResult.message);
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Project Categories</h1>
    <a href="/admin" class="text-primary hover:underline">Back to Dashboard</a>
  </div>
  
  {#if showSuccess}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <span>{successMessage}</span>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Categories List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Categories</h2>
      
      {#if data.categories && data.categories.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 text-left">Name</th>
                <th class="py-2 px-4 text-left">Slug</th>
                <th class="py-2 px-4 text-left">Projects</th>
                <th class="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each data.categories as category}
                <tr class="border-t">
                  <td class="py-2 px-4">{category.name}</td>
                  <td class="py-2 px-4">{category.slug}</td>
                  <td class="py-2 px-4">{category.projects?.length || 0}</td>
                  <td class="py-2 px-4 flex space-x-2">
                    <a href="/admin/categories/{category.id}/edit" class="text-blue-600 hover:underline">Edit</a>
                    <form 
                      method="POST" 
                      action="?/delete" 
                      use:enhance={() => {
                        return async ({ result }) => {
                          if (result.type === 'success') {
                            showSuccessMessage('Category deleted successfully');
                          }
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={category.id} />
                      <button type="submit" class="text-red-600 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-gray-500">No categories found. Add some using the form.</p>
      {/if}
    </div>
    
    <!-- Add Category Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Add New Category</h2>
      
      <form method="POST" action="?/create" use:enhance={handleSubmit}>
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md" 
            placeholder="e.g. web-development"
          />
          <p class="text-xs text-gray-500 mt-1">Leave empty to auto-generate from name</p>
        </div>
        

        
        <button 
          type="submit" 
          class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Category
        </button>
      </form>
    </div>
  </div>
</div>
