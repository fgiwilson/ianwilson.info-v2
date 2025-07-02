<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  
  // Define post type
  interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: string | null;
    status: string;
    featured: boolean;
  }
  
  // Props from server
  const data = page.data;
  
  // Blog posts state
  let posts = $state<BlogPost[]>(data.posts || []);
  let isLoading = $state(false);
  
  // Get URL parameters
  const urlParams = $state(page.url.searchParams);
  const showSuccessMessage = $derived(
    urlParams.get('created') === 'true' || urlParams.get('deleted') === 'true'
  );
  const successMessage = $derived(
    urlParams.get('created') === 'true'
      ? 'Post created successfully!'
      : urlParams.get('deleted') === 'true'
        ? 'Post deleted successfully!'
        : ''
  );
  
  // Auto-hide success message after 5 seconds
  onMount(() => {
    if (showSuccessMessage) {
      const hideMessage = () => {
        // Remove the query parameter without refreshing the page
        const url = new URL(window.location.href);
        url.searchParams.delete('created');
        url.searchParams.delete('deleted');
        window.history.replaceState({}, '', url);
      };
      
      setTimeout(hideMessage, 5000);
    }
  });
  
  // Format date
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Draft';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
</script>

<svelte:head>
  <title>Blog Posts | Admin | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Blog Posts</h1>
    <div>
      <a 
        href="/admin/posts/new" 
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <span class="mr-2" data-feather="plus"></span>
        New Post
      </a>
    </div>
  </div>
  
  {#if showSuccessMessage}
    <div class="rounded-md bg-green-50 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="text-green-400" data-feather="check-circle"></span>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Posts table -->
  <div class="bg-white shadow overflow-hidden rounded-lg">
    {#if isLoading}
      <div class="px-4 py-12 text-center">
        <p class="text-gray-500">Loading posts...</p>
      </div>
    {:else if posts.length === 0}
      <div class="px-4 py-12 text-center">
        <p class="text-gray-500">No blog posts found.</p>
        <p class="mt-2">
          <a href="/admin/posts/new" class="text-primary hover:text-primary-dark">Create your first post</a>
        </p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each posts as post}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {post.title}
                      </div>
                      <div class="text-sm text-gray-500">
                        {post.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    {post.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(post.publishedAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.featured ? 'Yes' : 'No'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-3 justify-end">
                    <a href={`/admin/posts/${post.id}/edit`} class="text-blue-600 hover:text-blue-800" aria-label="Edit post {post.title}">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </a>
                    <a href={`/admin/posts/${post.id}/delete`} class="text-red-600 hover:text-red-800" aria-label="Delete post {post.title}">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </a>
                    <a href={`/blog/${post.slug}`} target="_blank" class="text-gray-600 hover:text-gray-800" aria-label="View post {post.title}">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
