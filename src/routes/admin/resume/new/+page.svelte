<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  
  let sectionTypes = [
    { value: 'summary', label: 'Summary' },
    { value: 'work', label: 'Work Experience' },
    { value: 'education', label: 'Education' },
    { value: 'skills', label: 'Skills' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'custom', label: 'Custom Section' }
  ];
  
  // Form state
  let title = '';
  let type = 'work';
  let content = '';
  let order = 0;
  let formError = '';
  let formSuccess = '';
  
  // Handle form submission with enhance
  function handleEnhance() {
    return async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success') {
        formSuccess = 'Section created successfully!';
        formError = '';
        
        // Reset form after success
        title = '';
        type = 'work';
        content = '';
        order = 0;
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin/resume';
        }, 1500);
      } else if (result.type === 'failure') {
        formError = result.data?.message || 'Failed to create section';
        formSuccess = '';
      }
    };
  }
</script>

<div class="mb-6">
  <h1 class="text-2xl font-bold">Add New Resume Section</h1>
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
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="mb-4">
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
      <input
        type="text"
        id="title"
        name="title"
        bind:value={title}
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        placeholder="e.g., Work Experience"
      />
    </div>
    
    <div class="mb-4">
      <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
      <select
        id="type"
        name="type"
        bind:value={type}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
      >
        {#each sectionTypes as sectionType}
          <option value={sectionType.value}>{sectionType.label}</option>
        {/each}
      </select>
      <p class="text-sm text-gray-500 mt-1">
        This determines how the section will be displayed and organized.
      </p>
    </div>
    
    <div class="mb-4">
      <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
        Section Content (Optional)
      </label>
      <textarea
        id="content"
        name="content"
        bind:value={content}
        rows="5"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        placeholder="Optional markdown content for this section (e.g., for a summary section)"
      ></textarea>
      <p class="text-sm text-gray-500 mt-1">
        Supports markdown formatting. Leave empty if this section will only contain items.
      </p>
    </div>
    
    <div class="mb-6">
      <label for="order" class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
      <input
        type="number"
        id="order"
        name="order"
        bind:value={order}
        min="0"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
      />
      <p class="text-sm text-gray-500 mt-1">
        Determines the order in which sections appear (lower numbers appear first).
      </p>
    </div>
    
    <div class="flex justify-between">
      <a
        href="/admin/resume"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Create Section
      </button>
    </div>
  </form>
</div>
