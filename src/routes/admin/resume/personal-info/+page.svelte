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
        showSuccessMessage('Personal info updated successfully');
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
    <h1 class="text-2xl font-bold">Resume Personal Info</h1>
    <a href="/admin" class="text-primary hover:underline">Back to Dashboard</a>
  </div>
  
  {#if showSuccess}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <span>{successMessage}</span>
    </div>
  {/if}
  
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Personal Information Items</h2>
    
    {#if data.personalInfo && data.personalInfo.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left">Label</th>
              <th class="py-2 px-4 text-left">Value</th>
              <th class="py-2 px-4 text-left">Order</th>
              <th class="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.personalInfo as info}
              <tr class="border-t">
                <td class="py-2 px-4">{info.label}</td>
                <td class="py-2 px-4">{info.value}</td>
                <td class="py-2 px-4">{info.order}</td>
                <td class="py-2 px-4 flex space-x-2">
                  <a href="/admin/resume/personal-info/{info.id}/edit" class="text-blue-600 hover:underline">Edit</a>
                  <a href="/admin/resume/personal-info/{info.id}/delete" class="text-red-600 hover:underline">Delete</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="text-gray-500">No personal info items found. Add some below.</p>
    {/if}
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Add New Personal Info</h2>
    
    <form method="POST" action="?/create" use:enhance={handleSubmit}>
      <div class="mb-4">
        <label for="label" class="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input 
          type="text" 
          id="label" 
          name="label" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="value" class="block text-sm font-medium text-gray-700 mb-1">Value</label>
        <input 
          type="text" 
          id="value" 
          name="value" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
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
          value="0"
        />
      </div>
      
      <button 
        type="submit" 
        class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
      >
        Add Personal Info
      </button>
    </form>
  </div>
</div>
