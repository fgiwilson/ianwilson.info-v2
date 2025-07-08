<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  
  // Props from server
  const { data } = $props();
  
  // Form submission handler
  const handleSubmit: SubmitFunction = () => {
    return async ({ result }) => {
      const typedResult = result.type === 'success' 
        ? { success: true } 
        : { success: false, message: result.type === 'failure' && result.data ? result.data.message : 'An error occurred' };
      
      if (typedResult.success) {
        // Redirect to stats list on success
        window.location.href = '/admin/resume/stats';
      } else {
        // Handle error
        console.error(typedResult.message);
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Delete Resume Stat</h1>
    <a href="/admin/resume/stats" class="text-primary hover:underline">Back to Stats</a>
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Are you sure you want to delete this stat?</h2>
      <div class="bg-gray-100 p-4 rounded-md">
        <p><strong>Value:</strong> {data.stat.value}</p>
        <p><strong>Label:</strong> {data.stat.label}</p>
      </div>
      <p class="mt-4 text-red-600">This action cannot be undone.</p>
    </div>
    
    <form method="POST" use:enhance={handleSubmit}>
      <div class="flex space-x-4">
        <button 
          type="submit" 
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Delete Stat
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
