<script lang="ts">
  // Import any necessary components or data
  import { onMount } from 'svelte';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import { Briefcase, Code, FileText } from 'lucide-svelte';
  
  
  // Profile image URL (placeholder for now)
  const profileImageUrl = `/images/profile-placeholder.jpg`;
  
  // Feature cards data
  const featureCards = [
    {
      title: 'Project/Initiatives Management',
      description: 'Strategic planning, execution, and delivery of projects and initiatives.',
      icon: 'briefcase',
      link: '/portfolio?category=initiatives'
    },
    {
      title: 'Web Development',
      description: 'Modern, responsive web applications built with cutting-edge technologies.',
      icon: 'code',
      link: '/portfolio?category=web'
    },
    {
      title: 'Strategic/Technical Consulting',
      description: 'Delivering value through strategic and technical consulting services, and development of custom solutions.',
      icon: 'document',
      link: '/portfolio?category=consulting'
    }
  ];
  
  // Animation for elements (optional)
  let visible = false;
  
  onMount(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      visible = true;
    }, 100);
  });
</script>

<!-- Hero Section -->
<section class="py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row items-center justify-between gap-12">
      <!-- Hero Content -->
      <div class="md:w-1/2 space-y-6 text-center md:text-left">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          <span class="text-text">Hi, I'm </span>
          <span class="text-primary">Ian </span>
          <span class="text-accent">Wilson</span>
        </h1>
        
        <p class="text-xl text-text-light leading-relaxed">
          Initiatives, Strategic Operations and Brand Development and Design consulting, 
          I'm a results-driven professional with a proven track record of delivery. With a strong background in Web Development, Operational Project Management and Brand Development, 
          I'm passionate about creating innovative solutions that drive business growth and improve efficiency.
        </p>
        
        <div class="flex flex-wrap gap-4 justify-center md:justify-start">
          <a 
            href="/portfolio" 
            class="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            View My Work
          </a>
          <a 
            href="/contact" 
            class="btn-secondary px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Get In Touch
          </a>
        </div>
      </div>
      
      <!-- Profile Image -->
      <div class="md:w-1/2 flex justify-center md:justify-end">
        <div class="relative w-64 h-64 md:w-80 md:h-80">
          <!-- Profile image with optimization -->
          <div class="w-full h-full rounded-full overflow-hidden border-4 border-accent shadow-lg">
            <OptimizedImage 
              src={profileImageUrl} 
              alt="Ian Wilson" 
              width={320} 
              height={320} 
              class="w-full h-full object-cover"
              quality={90}
            />
          </div>
          <!-- No decorative elements -->
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Feature Cards Section -->
<section class="py-16 bg-background-alt">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
      <span class="text-primary">What I </span>
      <span class="text-accent">Do</span>
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each featureCards as card, i}
        <div 
          class="bg-background rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        >
          <!-- Card Icon -->
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
            {#if card.icon === 'briefcase'}
              <Briefcase class="w-8 h-8 text-primary"/>
            {:else if card.icon === 'code'}
              <Code class="w-8 h-8 text-primary"/>
            {:else if card.icon === 'document'}
              <FileText class="w-8 h-8 text-primary"/>
            {/if}
          </div>
          
          <!-- Card Content -->
          <h3 class="text-xl font-semibold mb-3 text-center md:text-left">{card.title}</h3>
          <p class="text-text-light mb-6 text-center md:text-left">{card.description}</p>
          
          <!-- Card Link -->
          <div class="text-center md:text-left">
            <a 
              href={card.link} 
              class="text-accent hover:text-accent-dark font-medium inline-flex items-center transition-colors duration-200"
            >
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Call to Action Section -->
<section class="py-16">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-6">
      <span class="text-primary">Ready to </span>
      <span class="text-accent">Work Together?</span>
    </h2>
    <p class="text-xl text-text-light max-w-2xl mx-auto mb-8">
      I'm currently available for freelance projects, full-time positions, and consulting work.
      Let's create something amazing together!
    </p>
    <a 
      href="/contact" 
      class="btn-primary px-8 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
    >
      Contact Me
    </a>
  </div>
</section>