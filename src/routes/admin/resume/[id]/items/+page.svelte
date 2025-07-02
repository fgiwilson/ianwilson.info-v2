<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  // Get data from the loader
  let { data } = $props<{ data: PageData }>();
  
  // Format date function
  function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  // Format date range
  function formatDateRange(startDate: string | null, endDate: string | null, current: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
    const end = current ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    }
    return '';
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">{data.section.title} Items</h1>
    <p class="text-gray-600">Manage items in this resume section</p>
  </div>
  <div class="flex space-x-2">
    <a href="/admin/resume" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
      Back to Sections
    </a>
    <a href="/admin/resume/{data.section.id}/items/new" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
      Add New Item
    </a>
  </div>
</div>

<div class="bg-white shadow rounded-lg p-6 mb-6">
  <h2 class="text-xl font-semibold mb-4">Section Details</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <p class="text-sm text-gray-500">Title</p>
      <p class="font-medium">{data.section.title}</p>
    </div>
    <div>
      <p class="text-sm text-gray-500">Type</p>
      <p class="font-medium">{data.section.type}</p>
    </div>
    <div class="md:col-span-2">
      <p class="text-sm text-gray-500">Content</p>
      <p class="font-medium">{data.section.content || 'No content'}</p>
    </div>
  </div>
  <div class="mt-4">
    <a href="/admin/resume/{data.section.id}/edit" class="text-primary hover:underline">
      Edit section details
    </a>
  </div>
</div>

{#if data.items.length > 0}
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data.items as item}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{item.title}</div>
              {#if item.subtitle}
                <div class="text-sm text-gray-500">{item.subtitle}</div>
              {/if}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{item.organization || '-'}</div>
              {#if item.location}
                <div class="text-sm text-gray-500">{item.location}</div>
              {/if}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.order}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <a href="/admin/resume/{data.section.id}/items/{item.id}/edit" class="text-blue-600 hover:text-blue-900">
                  Edit
                </a>
                <a href="/admin/resume/{data.section.id}/items/{item.id}/delete" class="text-red-600 hover:text-red-900">
                  Delete
                </a>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="bg-white shadow rounded-lg p-6 text-center">
    <p class="text-gray-500 mb-4">No items found in this section.</p>
    <p class="text-gray-500">Add your first item to get started.</p>
  </div>
{/if}
