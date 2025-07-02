<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import type { PageData } from './$types';
  
  // Get data from the loader
  let { data } = $props<{ data: PageData }>();
  
  // Form state
  let title = $state('');
  let subtitle = $state('');
  let organization = $state('');
  let location = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let current = $state(false);
  let content = $state('');
  let order = $state(0);
  let formError = $state('');
  let formSuccess = $state('');
  
  // Handle form submission with enhance
  function handleEnhance() {
    return async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success') {
        formSuccess = 'Item created successfully!';
        formError = '';
        
        // Reset form after success
        title = '';
        subtitle = '';
        organization = '';
        location = '';
        startDate = '';
        endDate = '';
        current = false;
        content = '';
        order = 0;
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = `/admin/resume/${data.section.id}/items`;
        }, 1500);
      }
    };
  };
  
  // Toggle current checkbox and clear end date if checked
  function handleCurrentChange() {
    if (current) {
      endDate = '';
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">Add New Item to {data.section.title}</h1>
    <p class="text-gray-600">Create a new resume item in this section</p>
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
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title*</label>
        <input
          type="text"
          id="title"
          name="title"
          bind:value={title}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., Software Engineer"
        />
      </div>
      
      <div>
        <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          bind:value={subtitle}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., Frontend Development"
        />
      </div>
      
      <div>
        <label for="organization" class="block text-sm font-medium text-gray-700 mb-1">Organization</label>
        <input
          type="text"
          id="organization"
          name="organization"
          bind:value={organization}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., Acme Inc."
        />
      </div>
      
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          bind:value={location}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., San Francisco, CA"
        />
      </div>
      
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          bind:value={startDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      
      <div class="flex flex-col">
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <div class="flex items-center space-x-4">
          <input
            type="date"
            id="endDate"
            name="endDate"
            bind:value={endDate}
            disabled={current}
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
          />
          <div class="flex items-center">
            <input
              type="checkbox"
              id="current"
              name="current"
              bind:checked={current}
              onchange={handleCurrentChange}
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="current" class="ml-2 block text-sm text-gray-700">
              Current
            </label>
          </div>
        </div>
      </div>
      
      <div class="md:col-span-2">
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          bind:value={content}
          rows="8"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Describe your responsibilities, achievements, etc. using Markdown formatting."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Supports Markdown formatting for rich text.
        </p>
      </div>
      
      <div>
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
          Determines the order in which items appear (lower numbers appear first).
        </p>
      </div>
    </div>
    
    <div class="flex justify-between mt-6">
      <a
        href="/admin/resume/{data.section.id}/items"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Create Item
      </button>
    </div>
  </form>
</div>
