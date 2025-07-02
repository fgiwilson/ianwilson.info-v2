<script lang="ts">
  import { browser } from '$app/environment';

  // Props for the component
  let { 
    src, 
    alt = '', 
    width = undefined, 
    height = undefined, 
    class: className = '',
    loading = 'lazy' as 'lazy' | 'eager' | null | undefined,
    sizes = '100vw',
    quality = 80
  } = $props();
  
  // Determine if this is a local or remote image
  const isRemoteImage = src && (src.startsWith('http') || src.startsWith('//'));
</script>

{#if isRemoteImage}
  <!-- For remote images, we use a regular img tag -->
  <img 
    src={src} 
    alt={alt} 
    width={width} 
    height={height} 
    class={className} 
    loading={loading} 
  />
{:else if browser}
  <!-- For local images in browser, use the enhanced:img tag -->
  <img 
    src={src} 
    alt={alt}
    width={width}
    height={height}
    class={className}
    loading={loading}
  />
{:else}
  <!-- Fallback for SSR -->
  <img 
    src={src} 
    alt={alt}
    width={width}
    height={height}
    class={className}
    loading={loading}
  />
{/if}
