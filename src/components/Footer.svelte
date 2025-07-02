<script lang="ts">
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  import { Github, Palette, Linkedin } from '@lucide/svelte';
  // Contact info
  const email = 'ian@wilsonsdesign.com';
  const phone = '+1 (530) 417-0586';

  
</script>

<footer class="bg-background-alt py-8 mt-16">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <!-- Logo and copyright -->
      <div class="mb-4 md:mb-0">
        <div class="flex items-center">
          <span class="text-xl font-bold">
            <span class="text-primary">Ian</span>
            <span class="text-accent">Wilson</span>
          </span>
        </div>
        <p class="text-text-light text-sm mt-2">
          Copyright © {currentYear} Ian Wilson. All rights reserved.
        </p>
      </div>
      
      <!-- Contact info -->
      <div class="flex flex-col items-center md:items-end">
        <a href={`mailto:${email}`} class="text-text hover:text-accent transition-colors duration-200 mb-1">
          {email}
        </a>
        <a href={`tel:${phone.replace(/\D/g, '')}`} class="text-text hover:text-accent transition-colors duration-200">
          {phone}
        </a>
      </div>
    </div>
    
    <!-- Social links (optional) -->
    <div class="flex justify-center md:justify-start mt-6 space-x-6">
      <a 
        href="https://github.com/fgiwilson" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="text-text-light hover:text-accent transition-colors duration-200"
        aria-label="GitHub Profile"
      >
        <Github />
      </a>
      <a 
        href="https://artstation.com/iwilson" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="text-text-light hover:text-accent transition-colors duration-200"
        aria-label="Dev.to Profile"
      >
        <Palette />
      </a>
      <a 
        href="https://linkedin.com/in/ijwilson" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="text-text-light hover:text-accent transition-colors duration-200"
        aria-label="LinkedIn Profile"
      >
        <Linkedin />
      </a>
    </div>
  </div>
</footer>