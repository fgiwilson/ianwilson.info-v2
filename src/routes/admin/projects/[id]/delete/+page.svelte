<script lang="ts">
  import { enhance } from '$app/forms';
  
  // Props from server
  const { data } = $props();
  const project = data.project;
  
  // Error state
  let error = $state('');
  
  // Form submission handler
  const handleEnhance = () => {
    return async ({ result }: { result: any }) => {
      if (result.type === 'failure') {
        error = result.data?.message || 'Failed to delete project. Please try again.';
      } else if (result.type === 'success') {
        // Show success message and redirect
        window.location.href = '/admin/projects?deleted=true';
      }
    };
  };
</script>

<svelte:head>
  <title>Delete Project | Admin | Ian Wilson</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Delete Project</h1>
  </div>
  
  {#if error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="bg-white shadow overflow-hidden rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <span class="text-red-600" data-feather="alert-triangle"></span>
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Project</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete the project "{project.title}"? This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      
      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <form method="POST" use:enhance={handleEnhance as any} class="sm:ml-3">
          <button 
            type="submit"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
          >
            Delete
          </button>
        </form>
        <a
          href="/admin/projects"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
        >
          Cancel
        </a>
      </div>
    </div>
  </div>
</div>
