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
    return async ({ result }: { result: ActionResult }) => {
      isDeleting = true;
      console.log('Form submission result:', result);
      
      if (result.type === 'success') {
        formSuccess = 'Skill deleted successfully!';
        formError = '';
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin/resume/skills';
        }, 1500);
      } else if (result.type === 'failure') {
        // Show error message from server
        formError = result.data?.message || 'Failed to delete skill';
        formSuccess = '';
        isDeleting = false;
      }
    };
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">Delete Skill</h1>
    <p class="text-gray-600">Are you sure you want to delete this skill?</p>
  </div>
  <a 
    href="/admin/resume/skills" 
    class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
  >
    Back to Skills
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
    <h2 class="text-xl font-semibold mb-2">{data.skill.name}</h2>
    <div class="text-gray-600 mb-1">Category: {data.skill.category}</div>
    <div class="text-gray-600 mb-1">Proficiency: {data.skill.percentage}%</div>
    <div class="text-gray-600 mb-1">Section: {data.skill.section.title}</div>
    <div class="text-gray-600">Order: {data.skill.order}</div>
  </div>
  
  <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">
          This action cannot be undone. This will permanently delete the skill.
        </p>
      </div>
    </div>
  </div>
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="flex justify-between">
      <a
        href="/admin/resume/skills"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Skill'}
      </button>
    </div>
  </form>
</div>
