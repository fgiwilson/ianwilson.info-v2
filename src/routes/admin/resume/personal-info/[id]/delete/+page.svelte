<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  
  // Props from server
  const { data } = $props();
  
  // Form submission handler
  const handleSubmit: SubmitFunction = () => {
    return async ({ result }) => {
      // This will redirect on success, but handle errors if they occur
      if (result.type !== 'success') {
        console.error('Error deleting personal info');
      }
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Delete Personal Info</h1>
    <a href="/admin/resume/personal-info" class="text-primary hover:underline">Back to Personal Info</a>
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Are you sure you want to delete this personal info item?</h2>
      <p class="text-gray-600 mb-4">This action cannot be undone.</p>
      
      <div class="bg-gray-50 p-4 rounded-md mb-4">
        <div class="mb-2">
          <span class="font-medium">Label:</span> {data.personalInfo.label}
        </div>
        <div>
          <span class="font-medium">Value:</span> {data.personalInfo.value}
        </div>
      </div>
    </div>
    
    <form method="POST" action="?/delete" use:enhance={handleSubmit}>
      <div class="flex space-x-4">
        <button 
          type="submit" 
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Confirm Delete
        </button>
        <a 
          href="/admin/resume/personal-info" 
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </a>
      </div>
    </form>
  </div>
</div>
