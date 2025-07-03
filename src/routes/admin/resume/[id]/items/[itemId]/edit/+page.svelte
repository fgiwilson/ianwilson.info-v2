<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import type { PageData } from './$types';
  
  // Get data from the loader
  let { data } = $props<{ data: PageData }>();
  
  // Form state
  let title = $state(data.item.title);
  let subtitle = $state(data.item.subtitle || '');
  let location = $state(data.item.location || '');
  let startDate = $state(data.item.startDate ? new Date(data.item.startDate).toISOString().split('T')[0] : '');
  let endDate = $state(data.item.endDate ? new Date(data.item.endDate).toISOString().split('T')[0] : '');
  let current = $state(data.item.current);
  let description = $state(data.item.description || '');
  let order = $state(data.item.order);
  let formError = $state('');
  let formSuccess = $state('');
  
  // Handle form submission with enhance
  function handleEnhance() {
    return async ({ result }: { result: ActionResult }) => {
      console.log('Form submission result:', result);
      
      if (result.type === 'success') {
        // Clear any previous error and show success message
        formSuccess = 'Item updated successfully!';
        formError = '';
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = `/admin/resume/${data.section.id}/items`;
        }, 1500);
      } else if (result.type === 'failure') {
        // Show error message from server
        formError = result.data?.message || 'Failed to update item';
        formSuccess = '';
      } else {
        // Handle any other result type
        console.log('Unexpected result type:', result.type);
      }
    };
  }
  
  // Toggle current checkbox and clear end date if checked
  function handleCurrentChange() {
    if (current) {
      endDate = '';
    }
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">Edit Resume Item</h1>
    <p class="text-gray-600">Update item in {data.section.title} section</p>
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
        />
      </div>
      
      <div>
        <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">Subtitle/Organization</label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          bind:value={subtitle}
          placeholder="Company or organization name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description (Markdown)
        </label>
        <textarea
          id="description"
          name="description"
          bind:value={description}
          rows="8"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
        Update Item
      </button>
    </div>
  </form>
</div>
