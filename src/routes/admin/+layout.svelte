<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  // Get current path for active link styling
  $: currentPath = $page.url.pathname;
  
  // Navigation items
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'grid' },
    { href: '/admin/posts', label: 'Blog Posts', icon: 'file-text' },
    { href: '/admin/projects', label: 'Projects', icon: 'briefcase' },
    { href: '/admin/resume', label: 'Resume', icon: 'file' },
    { href: '/admin/media', label: 'Media', icon: 'image' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' }
  ];
  
  // Feather icons initialization
  onMount(() => {
    // Initialize Feather icons
    if (typeof window !== 'undefined' && 'feather' in window) {
      // @ts-ignore - Feather is loaded from CDN
      window.feather.replace();
    }
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button') as HTMLButtonElement | null;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement | null;
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  });
</script>

<svelte:head>
  <title>Admin | Ian Wilson</title>
  <!-- Include Feather Icons for admin UI -->
  <script src="https://unpkg.com/feather-icons"></script>
</svelte:head>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <div class="hidden md:flex md:flex-shrink-0">
    <div class="flex flex-col w-64">
      <div class="flex flex-col flex-grow pt-5 overflow-y-auto bg-primary text-white">
        <div class="flex items-center flex-shrink-0 px-4 mb-5">
          <a href="/admin" class="text-xl font-bold text-white">Admin Dashboard</a>
        </div>
        <nav class="flex-1 px-2 pb-4 space-y-1">
          {#each navItems as item}
            <a 
              href={item.href} 
              class="flex items-center px-4 py-2 text-sm rounded-md {currentPath === item.href ? 'bg-primary-dark text-white' : 'text-white hover:bg-primary-dark'}"
            >
              <span class="mr-3" data-feather={item.icon}></span>
              {item.label}
            </a>
          {/each}
        </nav>
        <div class="p-4 mt-auto">
          <a 
            href="/" 
            class="flex items-center px-4 py-2 text-sm text-white hover:bg-primary-dark rounded-md"
          >
            <span class="mr-3" data-feather="external-link"></span>
            View Site
          </a>
          <form method="POST" action="/admin/logout">
            <button 
              type="submit"
              class="flex w-full items-center px-4 py-2 mt-2 text-sm text-white hover:bg-primary-dark rounded-md"
            >
              <span class="mr-3" data-feather="log-out"></span>
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile header -->
  <div class="flex flex-col flex-1 overflow-hidden">
    <div class="md:hidden">
      <div class="flex items-center justify-between bg-primary text-white p-4">
        <a href="/admin" class="text-xl font-bold">Admin</a>
        <button 
          id="mobile-menu-button" 
          class="p-1 rounded-md hover:bg-primary-dark"
          aria-label="Toggle mobile menu"
        >
          <span data-feather="menu"></span>
        </button>
      </div>
      <!-- Mobile menu (hidden by default) -->
      <div id="mobile-menu" class="hidden bg-primary text-white p-4">
        <nav class="space-y-1">
          {#each navItems as item}
            <a 
              href={item.href} 
              class="flex items-center px-4 py-2 text-sm rounded-md {currentPath === item.href ? 'bg-primary-dark text-white' : 'text-white hover:bg-primary-dark'}"
            >
              <span class="mr-3" data-feather={item.icon}></span>
              {item.label}
            </a>
          {/each}
          <a 
            href="/" 
            class="flex items-center px-4 py-2 text-sm text-white hover:bg-primary-dark rounded-md"
          >
            <span class="mr-3" data-feather="external-link"></span>
            View Site
          </a>
          <form method="POST" action="/admin/logout">
            <button 
              type="submit"
              class="flex w-full items-center px-4 py-2 mt-2 text-sm text-white hover:bg-primary-dark rounded-md"
            >
              <span class="mr-3" data-feather="log-out"></span>
              Logout
            </button>
          </form>
        </nav>
      </div>
    </div>
    
    <!-- Main content -->
    <main class="flex-1 overflow-y-auto p-6 bg-gray-100">
      <slot />
    </main>
  </div>
</div>



<style>
  /* Add any custom styles here */
</style>
