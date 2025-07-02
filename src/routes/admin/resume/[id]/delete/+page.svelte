<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import type { PageData } from './$types';
  
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
      
      if (result.type === 'failure') {
        formError = result.data?.message || 'Failed to delete section';
        formSuccess = '';
      } else if (result.type === 'success') {
        // Show success message and redirect
        window.location.href = '/admin/resume?deleted=true';
      }
    };
  }
</script>

<div class="mb-6">
  <h1 class="text-2xl font-bold">Delete Resume Section</h1>
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
      Are you sure you want to delete the section "<strong>{data.section.title}</strong>"?
    </p>
    
    {#if data.section.items.length > 0}
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              This section contains <strong>{data.section.items.length}</strong> items that will also be deleted.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="flex justify-between">
      <a
        href="/admin/resume"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Section'}
      </button>
    </div>
  </form>
</div>
