<script lang="ts">
  // Define props for the header component
  let { activePage = '' } = $props();

  import { Github, Palette, Linkedin } from '@lucide/svelte';
  
  // State for mobile menu toggle
  let isMenuOpen = $state(false);
  
  // Function to toggle mobile menu
  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  // Navigation links
  const navLinks = [
    { name: 'Blog', href: '/blog' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Resume', href: '/resume' }
  ];
  
  // Social links
  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/fgiwilson', icon: 'github' },
    { name: 'Artstation', href: 'https://artstation.com/iwilson', icon: 'artstation' },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/ijwilson', icon: 'linkedin' }
  ];
</script>

<header class="py-4 border-b border-gray-200">
  <div class="container mx-auto px-4 flex justify-between items-center">
    <!-- Logo -->
    <a href="/" class="flex items-center">
      <span class="text-2xl font-bold">
        <span class="text-primary">Ian</span>
        <span class="text-accent">Wilson</span>
      </span>
    </a>
    
    <!-- Navigation -->
    <nav class="hidden md:flex items-center space-x-8">
      {#each navLinks as link}
        <a 
          href={link.href} 
          class="text-text hover:text-accent transition-colors duration-200 {activePage === link.name.toLowerCase() ? 'font-semibold' : ''}"
        >
          {link.name}
        </a>
      {/each}
      
      <!-- Social Links -->
      <div class="flex items-center space-x-4 ml-6">
        {#each socialLinks as link}
          <a 
            href={link.href} 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-text hover:text-accent transition-colors duration-200"
            aria-label={link.name + " Profile"}
          >
            {#if link.icon === 'github'}
              <Github />
            {:else if link.icon === 'artstation'}
              <Palette />
            {:else if link.icon === 'linkedin'}
              <Linkedin />
            {/if}
          </a>
        {/each}
      </div>
    </nav>
    
    <!-- Mobile menu button -->
    <button 
      class="md:hidden text-text hover:text-accent" 
      aria-label="Toggle mobile menu"
      onclick={toggleMobileMenu}
    >
      {#if isMenuOpen}
        <!-- X icon for closing -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      {:else}
        <!-- Hamburger icon for opening -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      {/if}
    </button>
  </div>
  
  <!-- Mobile menu -->
  {#if isMenuOpen}
    <div class="md:hidden bg-white border-b border-gray-200 shadow-md">
      <div class="container mx-auto px-4 py-3">
        <nav class="flex flex-col space-y-4">
          <!-- Navigation links -->
          {#each navLinks as link}
            <a 
              href={link.href} 
              class="py-2 text-text hover:text-accent transition-colors duration-200 {activePage === link.name.toLowerCase() ? 'font-semibold' : ''}"
              onclick={toggleMobileMenu}
            >
              {link.name}
            </a>
          {/each}
          
          <!-- Social links -->
          <div class="flex items-center space-x-4 py-2">
            {#each socialLinks as link}
              <a 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-text hover:text-accent transition-colors duration-200"
                aria-label={link.name + " Profile"}
              >
                {#if link.icon === 'github'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                {:else if link.icon === 'devto'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.826 10.083a.784.784 0 0 0-.468-.175h-.701v4.198h.701a.786.786 0 0 0 .469-.175c.155-.117.233-.292.233-.525v-2.798c.001-.233-.079-.408-.234-.525zM19.236 3H4.764C3.791 3 3.002 3.787 3 4.76v14.48c.002.973.791 1.76 1.764 1.76h14.473c.973 0 1.762-.787 1.764-1.76V4.76A1.765 1.765 0 0 0 19.236 3zM9.195 13.414c0 .755-.466 1.901-1.942 1.898H5.389V8.665h1.903c1.424 0 1.902 1.144 1.903 1.899v2.85zm4.045-3.562H11.1v1.544h1.309v1.188H11.1v1.543h2.142v1.188h-2.498a.813.813 0 0 1-.833-.792V9.497a.813.813 0 0 1 .792-.832h2.539l-.002 1.187zm4.165 4.632c-.531 1.235-1.481.99-1.906 0l-1.548-5.818h1.309l1.193 4.569 1.188-4.569h1.31l-1.546 5.818z"></path></svg>
                {:else if link.icon === 'linkedin'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                {/if}
              </a>
            {/each}
          </div>
        </nav>
      </div>
    </div>
  {/if}
</header>
