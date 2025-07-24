<script lang="ts">
  // Define props for the header component
  let { activePage = '' } = $props();

  import '@awesome.me/kit-b2c306474b/icons/css/all.min.css';
  
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
              <i class="fa-brands fa-github fa-xl"></i>
            {:else if link.icon === 'artstation'}
              <i class="fa-brands fa-artstation fa-xl"></i>
            {:else if link.icon === 'linkedin'}
              <i class="fa-brands fa-linkedin fa-xl"></i>
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
                  <i class="fa-brands fa-github fa-xl"></i>
                {:else if link.icon === 'devto'}
                  <i class="fa-brands fa-dev fa-xl"></i>
                {:else if link.icon === 'linkedin'}
                  <i class="fa-brands fa-linkedin fa-xl"></i>
                {/if}
              </a>
            {/each}
          </div>
        </nav>
      </div>
    </div>
  {/if}
</header>


<style>

</style>