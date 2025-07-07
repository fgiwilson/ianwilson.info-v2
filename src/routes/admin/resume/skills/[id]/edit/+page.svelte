<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import type { PageData } from './$types';
  
  // Get data from the loader
  let { data } = $props<{ data: PageData }>();
  
  // Form state
  let name = $state(data.skill.name);
  let percentage = $state(data.skill.percentage);
  let category = $state(data.skill.category);
  let order = $state(data.skill.order);
  let sectionId = $state(data.skill.sectionId);
  let formError = $state('');
  let formSuccess = $state('');
  
  // Handle form submission with enhance
  function handleEnhance() {
    return async ({ result }: { result: ActionResult }) => {
      console.log('Form submission result:', result);
      
      if (result.type === 'success') {
        formSuccess = 'Skill updated successfully!';
        formError = '';
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin/resume/skills';
        }, 1500);
      } else if (result.type === 'failure') {
        // Show error message from server
        formError = result.data?.message || 'Failed to update skill';
        formSuccess = '';
      }
    };
  }
</script>

<div class="mb-6 flex justify-between items-center">
  <div>
    <h1 class="text-2xl font-bold">Edit Skill</h1>
    <p class="text-gray-600">Update skill details</p>
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
  
  <form method="POST" use:enhance={handleEnhance}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Skill Name*</label>
        <input
          type="text"
          id="name"
          name="name"
          bind:value={name}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., React.js"
        />
      </div>
      
      <div>
        <label for="percentage" class="block text-sm font-medium text-gray-700 mb-1">Proficiency (%)</label>
        <input
          type="number"
          id="percentage"
          name="percentage"
          bind:value={percentage}
          min="0"
          max="100"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="e.g., 80"
        />
      </div>
      
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select 
          id="category" 
          name="category" 
          bind:value={category}
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="Frontend">Frontend Development</option>
          <option value="Backend">Backend Development</option>
          <option value="DevOps">DevOps</option>
          <option value="Design">Design</option>
          <option value="General">General</option>
        </select>
      </div>
      
      <div>
        <label for="order" class="block text-sm font-medium text-gray-700 mb-1">Order</label>
        <input 
          type="number" 
          id="order" 
          name="order" 
          bind:value={order}
          class="w-full px-3 py-2 border border-gray-300 rounded-md" 
        />
      </div>
      
      <div class="md:col-span-2">
        <label for="sectionId" class="block text-sm font-medium text-gray-700 mb-1">Section*</label>
        <select 
          id="sectionId" 
          name="sectionId" 
          bind:value={sectionId}
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          {#each data.sections as section}
            <option value={section.id}>{section.title}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="flex justify-between mt-6">
      <a
        href="/admin/resume/skills"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Update Skill
      </button>
    </div>
  </form>
</div>
