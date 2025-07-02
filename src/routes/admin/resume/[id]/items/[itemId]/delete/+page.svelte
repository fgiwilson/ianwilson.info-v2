<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  
  // Define PageData interface until $types is generated
  interface PageData {
    section: {
      id: string;
      title: string;
      type?: string;
    };
    item: {
      id: string;
      title: string;
      subtitle: string | null;
      organization?: string;
      location: string | null;
    };
  }
  
  // Get data from the loader
  let { data } = $props<{ data: PageData }>();
  
  // Form state
  let formError = $state('');
  let formSuccess = $state('');
  let isDeleting = $state(false);
  
  // Handle form submission with enhance
  function handleEnhance() {
    isDeleting = true;
    
    return async ({ result }: { result: ActionResult }) => {
      isDeleting = false;
      
      if (result.type === 'success') {
        formSuccess = 'Item deleted successfully!';
        formError = '';
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = `/admin/resume/${data.section.id}/items`;
        }, 1500);
      } else if (result.type === 'failure') {
        formError = result.data?.message || 'Failed to delete item';
        formSuccess = '';
      }
    };
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">Delete Resume Item</h1>
    <p class="text-gray-600">Remove item from {data.section.title} section</p>
  </div>
  <a 
    href="/admin/resume/{data.section.id}/items" 
    class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
  >
    Back to Items
  </a>
</div>

<div class="bg-white shadow rounded-lg p-6">
  {#if formSuccess}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{formSuccess}</span>
    </div>
  {/if}
  
  {#if formError}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{formError}</span>
    </div>
  {/if}
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-red-600 mb-2">Warning: This action cannot be undone</h2>
    <p class="text-gray-700 mb-4">
      Are you sure you want to delete the item "<strong>{data.item.title}</strong>"?
    </p>
    
    <div class="bg-gray-50 p-4 rounded-md mb-4">
      <h3 class="font-medium mb-2">Item Details:</h3>
      <ul class="text-gray-700 space-y-1">
        <li><strong>Title:</strong> {data.item.title}</li>
        {#if data.item.subtitle}
          <li><strong>Subtitle:</strong> {data.item.subtitle}</li>
        {/if}
        {#if data.item.organization}
          <li><strong>Organization:</strong> {data.item.organization}</li>
        {/if}
        {#if data.item.location}
          <li><strong>Location:</strong> {data.item.location}</li>
        {/if}
      </ul>
    </div>
  </div>
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="flex justify-between">
      <a
        href="/admin/resume/{data.section.id}/items"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Item'}
      </button>
    </div>
  </form>
</div>
