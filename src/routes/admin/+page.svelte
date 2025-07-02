<script lang="ts">
  import { onMount } from 'svelte';
  import {Plus, Briefcase, FileText, Image, Eye, FileSpreadsheet, User, Award, BarChart} from 'lucide-svelte';
  const { data } = $props();
  
  // Define content types
  interface DashboardStats {
    posts: number;
    projects: number;
    media: number;
    views: number;
  }
  
  interface ContentItem {
    title: string;
    date: string;
    status: string;
  }
  
  // Dashboard stats (these would normally come from the server)
  let stats = $state<DashboardStats>({
    posts: 0,
    projects: 0,
    media: 0,
    views: 0
  });
  
  // Recent content (would normally come from the server)
  let recentPosts = $state<ContentItem[]>([]);
  let recentProjects = $state<ContentItem[]>([]);
  
  // Mock data loading
  onMount(() => {
    // Simulate loading data
    setTimeout(() => {
      stats.posts = data.postCount;
      stats.projects = data.projectCount;
      stats.media = data.mediaCount;
      stats.views = data.viewCount;
      

  
      
      // Update state
      recentPosts.length = 0;
      recentProjects.length = 0;

      for (const post of data.recentPosts) {
        recentPosts.push({
          title: post.title,
          date: post.createdAt.toISOString(),
          status: post.publishedAt ? 'Published' : 'Draft'
        });
      }

      for (const project of data.recentProjects) {
        recentProjects.push({
          title: project.title,
          date: project.createdAt.toISOString(),
          status: project.createdAt ? 'Published' : 'Draft'
        });
      }
    }, 500);
  });
</script>

<svelte:head>
  <title>Admin Dashboard | Ian Wilson</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <div class="flex space-x-3">
      <div>
        <a 
          href="/admin/posts/new" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus class="mr-2" />
          New Post
        </a>
      </div>
      <div>
        <a 
          href="/admin/projects/new" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus class="mr-2" />
          New Project
        </a>
      </div>
      <div>
        <a 
          href="/admin/media" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Image class="mr-2" />
          Media Library
        </a>
      </div>
      <div>
        <a 
          href="/admin/resume" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FileSpreadsheet class="mr-2" />
          Resume
        </a>
      </div>
    </div>
  </div>
  
  <!-- Stats -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
            <FileText class="text-primary" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Posts
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">
                {stats.posts}
              </div>
            </dd>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div class="text-sm">
          <a href="/admin/posts" class="font-medium text-primary hover:text-primary-dark">
            View all posts <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
    
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
            <Briefcase class="text-primary" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Projects
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">
                {stats.projects}
              </div>
            </dd>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div class="text-sm">
          <a href="/admin/projects" class="font-medium text-primary hover:text-primary-dark">
            View all projects <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
    
    <div class="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
            <Image class="text-primary" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Media Files
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">
                {stats.media}
              </div>
            </dd>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div class="text-sm">
          <a href="/admin/media" class="font-medium text-primary hover:text-primary-dark">
            View all media <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
    
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
            <Eye class="text-primary" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Views
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">
                {stats.views}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Resume Management -->
  <div class="bg-white shadow rounded-lg mb-6">
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Resume Management
      </h3>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a 
          href="/admin/resume/personal-info" 
          class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
              <User class="text-primary" />
            </div>
            <div class="ml-4">
              <h4 class="text-base font-medium text-gray-900">Personal Info</h4>
              <p class="text-sm text-gray-500">Manage contact details and sidebar info</p>
            </div>
          </div>
        </a>
        
        <a 
          href="/admin/resume/skills" 
          class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
              <Award class="text-primary" />
            </div>
            <div class="ml-4">
              <h4 class="text-base font-medium text-gray-900">Skills</h4>
              <p class="text-sm text-gray-500">Manage skills with percentages and categories</p>
            </div>
          </div>
        </a>
        
        <a 
          href="/admin/resume/stats" 
          class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
              <BarChart class="text-primary" />
            </div>
            <div class="ml-4">
              <h4 class="text-base font-medium text-gray-900">Stats</h4>
              <p class="text-sm text-gray-500">Manage resume statistics</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
  
  <!-- Content Management -->
  <div class="bg-white shadow rounded-lg mb-6">
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Content Management
      </h3>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a 
          href="/admin/categories" 
          class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
              <Briefcase class="text-primary" />
            </div>
            <div class="ml-4">
              <h4 class="text-base font-medium text-gray-900">Project Categories</h4>
              <p class="text-sm text-gray-500">Manage project categories</p>
            </div>
          </div>
        </a>
        
        <a 
          href="/admin/tags" 
          class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-light rounded-md p-3">
              <FileText class="text-primary" />
            </div>
            <div class="ml-4">
              <h4 class="text-base font-medium text-gray-900">Blog Tags</h4>
              <p class="text-sm text-gray-500">Manage blog post tags</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
  
  <!-- Recent content -->
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
    <!-- Recent Posts -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Recent Posts
        </h3>
      </div>
      <div class="px-4 py-3 sm:px-6">
        {#if recentPosts.length === 0}
          <p class="text-gray-500 text-sm py-4">Loading recent posts...</p>
        {:else}
          <ul class="divide-y divide-gray-200">
            {#each recentPosts as post}
              <li class="py-3 flex justify-between items-center">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{post.title}</span>
                  <span class="text-sm text-gray-500">{post.date}</span>
                </div>
                <div>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    {post.status}
                  </span>
                </div>
              </li>
            {/each}
          </ul>
          <div class="mt-4">
            <a href="/admin/posts" class="text-sm font-medium text-primary hover:text-primary-dark">
              View all posts <span aria-hidden="true">→</span>
            </a>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Recent Projects -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Recent Projects
        </h3>
      </div>
      <div class="px-4 py-3 sm:px-6">
        {#if recentProjects.length === 0}
          <p class="text-gray-500 text-sm py-4">Loading recent projects...</p>
        {:else}
          <ul class="divide-y divide-gray-200">
            {#each recentProjects as project}
              <li class="py-3 flex justify-between items-center">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{project.title}</span>
                  <span class="text-sm text-gray-500">{project.date}</span>
                </div>
                <div>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {project.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    {project.status}
                  </span>
                </div>
              </li>
            {/each}
          </ul>
          <div class="mt-4">
            <a href="/admin/projects" class="text-sm font-medium text-primary hover:text-primary-dark">
              View all projects <span aria-hidden="true">→</span>
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

