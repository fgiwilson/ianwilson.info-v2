<script lang="ts">
  // Image gallery component for displaying multiple images in a grid
  // Using Svelte 5 runes
  
  // Define the custom window interface for TypeScript
  interface CustomWindow extends Window {
    imageModal?: {
      open: (imageUrl: string, alt?: string) => void;
      close: () => void;
    };
  }
  
  // Define the image type to handle various formats
  type ImageType = string | {
    src?: string;
    alt?: string;
    path?: string;
    url?: string;
    href?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    [key: string]: any; // Allow any other properties
  };
  
  // Define the props
  const { images = [], columns = 3, gap = 4 } = $props<{
    images: ImageType[];
    columns?: number;
    gap?: number;
  }>();
  
  // Function to extract image URL from various object formats
  function getImageUrl(image: ImageType): string {
    if (typeof image === 'string') {
      return image;
    }
    
    // Handle various image object formats
    if (image) {
      if (image.src) return image.src;
      if (image.path) return image.path;
      if (image.url) return image.url;
      if (image.href) return image.href;
      
      // Try to find any property that looks like a URL
      for (const key in image) {
        if (typeof image[key] === 'string' && 
            (image[key].startsWith('http') || 
             image[key].startsWith('/') || 
             image[key].includes('.jpg') || 
             image[key].includes('.png') || 
             image[key].includes('.gif') || 
             image[key].includes('.webp'))) {
          return image[key];
        }
      }
    }
    
    // Fallback to placeholder
    return '/images/placeholder.jpg';
  }
  
  // Function to get alt text
  function getAltText(image: ImageType): string {
    if (typeof image === 'string') {
      return '';
    }
    
    return image.alt || image.title || image.description || '';
  }
  
  // Function to handle image click
  function handleImageClick(image: ImageType) {
    // Get the image URL and alt text
    const imageUrl = getImageUrl(image);
    const altText = getAltText(image);
    
    // Open the modal if it exists
    if (typeof window !== 'undefined') {
      const customWindow = window as unknown as CustomWindow;
      if (customWindow.imageModal) {
        customWindow.imageModal.open(imageUrl, altText);
      }
    }
  }
</script>

<div 
  class="image-gallery"
  style="display: grid; grid-template-columns: repeat({columns}, 1fr); gap: {gap/4}rem;"
>
  {#each images as image}
    <div 
      class="gallery-item cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      onclick={() => handleImageClick(image)}
      onkeydown={(e) => e.key === 'Enter' && handleImageClick(image)}
      tabindex="0"
      role="button"
      aria-label={`View ${image.alt || 'image'} in full size`}
    >
      <img 
        src={image.thumbnail || image.src} 
        alt={image.alt || ''} 
        class="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-300"
        loading="lazy"
      />
    </div>
  {/each}
</div>
