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
        showSuccessMessage('Stat updated successfully');
      } else {
        // Handle error
        console.error(typedResult.message);
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Edit Resume Stat</h1>
    <a href="/admin/resume/stats" class="text-primary hover:underline">Back to Stats</a>
  </div>
  
  {#if showSuccess}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <span>{successMessage}</span>
    </div>
  {/if}
  
  <div class="bg-white rounded-lg shadow-md p-6">
    <form method="POST" use:enhance={handleSubmit}>
      <div class="mb-4">
        <label for="value" class="block text-sm font-medium text-gray-700 mb-1">Value</label>
        <input 
          type="text" 
          id="value" 
          name="value" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
          value={data.stat.value}
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="label" class="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input 
          type="text" 
          id="label" 
          name="label" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
          value={data.stat.label}
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="order" class="block text-sm font-medium text-gray-700 mb-1">Order</label>
        <input 
          type="number" 
          id="order" 
          name="order" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
          value={data.stat.order}
        />
      </div>
      
      <div class="flex space-x-4">
        <button 
          type="submit" 
          class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Update Stat
        </button>
        <a 
          href="/admin/resume/stats" 
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </a>
      </div>
    </form>
  </div>
</div>
