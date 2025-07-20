<script lang="ts">
  import { formatDate } from '$lib/utils/date';
  import BlogLayout from '$lib/layouts/BlogLayout.svelte';
  import { parseMarkdown } from '$lib/utils/markdown';
  import ImageModal from '$lib/components/ImageModal.svelte';
  import ImageGallery from '$lib/components/ImageGallery.svelte';
  import { onMount } from 'svelte';
  
  // Using Svelte 5 runes
  let { data } = $props();
  
  // Determine if this is a markdown post or database post
  const isMarkdown = $derived(data.isMarkdown);
  
  // For markdown posts
  const content = $derived(isMarkdown ? data.content : null);
  const metadata = $derived(isMarkdown ? data.metadata : null);
  
  // For database posts
  const post = $derived(!isMarkdown ? data.post : null);
  
  // Define the custom window interface for TypeScript
  interface CustomWindow extends Window {
    imageModal?: {
      open: (imageUrl: string, alt?: string) => void;
      close: () => void;
    };
  }
  
  // Create the modal component if it doesn't exist
  function createImageModal() {
    // Check if modal already exists
    if (document.getElementById('image-modal')) return;
    
    // Create a placeholder image if it doesn't exist
    const placeholderImg = new Image();
    placeholderImg.src = '/images/placeholder.jpg';
    placeholderImg.style.display = 'none';
    document.body.appendChild(placeholderImg);
    
    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'image-modal';
    modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm hidden';
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    modalContainer.setAttribute('aria-label', 'Image preview');
    
    // Create the modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'relative max-w-4xl max-h-[90vh] overflow-auto';
    
    // Create the image element
    const modalImage = document.createElement('img');
    modalImage.className = 'max-w-full max-h-[85vh] object-contain rounded-lg';
    modalImage.id = 'modal-image';
    modalImage.alt = '';
    modalImage.onerror = function() {
      this.onerror = null;
      this.src = '/images/placeholder.jpg';
    };
    
    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    closeButton.setAttribute('aria-label', 'Close image preview');
    
    // Add elements to the DOM
    modalContent.appendChild(modalImage);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    closeButton.addEventListener('click', () => {
      modalContainer.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
    
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        modalContainer.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
        modalContainer.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
    
    // Add the modal to the window object
    const customWindow = window as unknown as CustomWindow;
    customWindow.imageModal = {
      open: (imageUrl: string, alt: string = '') => {
        const img = document.getElementById('modal-image') as HTMLImageElement;
        if (img) {
          // Validate the image URL
          if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
            console.warn('Invalid image URL in modal.open, using placeholder');
            imageUrl = '/images/placeholder.jpg';
          }
          
          img.src = imageUrl;
          img.alt = alt;
          modalContainer.classList.remove('hidden');
          document.body.classList.add('overflow-hidden');
        }
      },
      close: () => {
        modalContainer.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    };
  }
  
  // Function to fix all images in the document
  function fixAllImages() {
    console.log('Fixing all images in the document');
    
    // Fix any undefined images in the document
    const undefinedImages = document.querySelectorAll('img[src="undefined"], img[alt="undefined"], img[src=""]');
    undefinedImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      console.warn('Found undefined image, replacing with placeholder');
      imgElement.src = '/images/placeholder.jpg';
    });
    
    // Also fix any images with text "undefined" in the src
    const allImages = document.querySelectorAll('img');
    allImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const src = imgElement.getAttribute('src');
      if (!src || src === 'undefined' || src === 'null' || src === '' || src.includes('undefined')) {
        console.warn('Found image with invalid src:', src);
        imgElement.src = '/images/placeholder.jpg';
      }
      
      // Add error handler to all images
      imgElement.onerror = function() {
        console.warn('Image failed to load:', this.src);
        this.onerror = null;
        this.src = '/images/placeholder.jpg';
      };
    });
    
    // Fix any broken image elements
    document.querySelectorAll('img[alt="undefined"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.alt = 'Image';
      if (!imgElement.src || imgElement.src === 'undefined' || imgElement.src.includes('undefined')) {
        imgElement.src = '/images/placeholder.jpg';
      }
    });
  }
  
  // Process the rendered content after the component is mounted
  onMount(() => {
    // Create the image modal
    createImageModal();
    
    // Get the custom window object
    const customWindow = window as CustomWindow;
    
    // Fix all images immediately
    fixAllImages();
    
    // Also fix images after a short delay to catch any that might be added dynamically
    setTimeout(fixAllImages, 500);
    
    // Process galleries
    const galleries = document.querySelectorAll('[data-gallery="true"]');
    galleries.forEach(gallery => {
      const imagesData = gallery.getAttribute('data-images');
      const columns = parseInt(gallery.getAttribute('data-columns') || '3');
      
      if (!imagesData) return;
      
      try {
        // Parse the images data
        const images = JSON.parse(imagesData);
        
        // Create a gallery container
        const galleryContainer = document.createElement('div');
        galleryContainer.className = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4 mt-4`;
        
        // Add images to the gallery
        images.forEach((image: { src: any; alt?: string; thumbnail?: string }) => {
          // Process image src if it's an object
          if (typeof image.src === 'object' && image.src !== null) {
            // Check for Linode Object Storage URLs in the object
            const imageStr = JSON.stringify(image.src);
            if (imageStr.includes('linodeobjects.com')) {
              // Search for Linode URL pattern in the object
              const linodeUrlMatch = imageStr.match(/https?:\/\/[\w.-]+\.linodeobjects\.com\/[\w.-]+\/uploads\/[\d-]+\/[\w.-]+\.[a-zA-Z0-9]+/);
              if (linodeUrlMatch && linodeUrlMatch[0]) {
                console.log('Found Linode Object Storage URL in gallery image:', linodeUrlMatch[0]);
                image.src = linodeUrlMatch[0];
              }
            } 
            // Try to extract the URL from various possible properties
            else if (image.src.href && typeof image.src.href === 'string') {
              image.src = image.src.href;
            } else if (image.src.path && typeof image.src.path === 'string') {
              image.src = image.src.path;
            } else if (image.src.url && typeof image.src.url === 'string') {
              image.src = image.src.url;
            } else {
              // Try to find any property that looks like a URL
              let foundUrl = false;
              for (const key in image.src) {
                if (typeof image.src[key] === 'string' && 
                    (image.src[key].startsWith('http') || 
                     image.src[key].startsWith('/') || 
                     image.src[key].includes('.jpg') || 
                     image.src[key].includes('.png') || 
                     image.src[key].includes('.gif') || 
                     image.src[key].includes('.webp'))) {
                  console.log(`Found URL in property ${key}:`, image.src[key]);
                  image.src = image.src[key];
                  foundUrl = true;
                  break;
                }
              }
              
              if (!foundUrl) {
                console.warn('Could not extract valid URL from image.src object, using placeholder');
                image.src = '/images/placeholder.jpg';
              }
            }
          }
          
          // Skip images with undefined or empty src
          if (!image.src || image.src === 'undefined' || image.src === 'null') {
            console.warn('Skipping gallery image with undefined or empty src');
            image.src = '/images/placeholder.jpg';
          }
          
          const itemDiv = document.createElement('div');
          itemDiv.className = 'gallery-item cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300';
          itemDiv.tabIndex = 0;
          itemDiv.role = 'button';
          itemDiv.setAttribute('aria-label', `View ${image.alt || 'image'} in full size`);
          
          // Add click handler
          itemDiv.onclick = () => {
            if (customWindow.imageModal && image.src) {
              customWindow.imageModal.open(image.src, image.alt || '');
            }
          };
          
          // Add keyboard handler
          itemDiv.onkeydown = (e) => {
            if (e.key === 'Enter' && customWindow.imageModal && image.src) {
              customWindow.imageModal.open(image.src, image.alt || '');
            }
          };
          
          // Create image element
          const imgElement = document.createElement('img');
          // Use a placeholder if src is missing
          imgElement.src = image.thumbnail || image.src || '/images/placeholder.jpg';
          imgElement.alt = image.alt || '';
          imgElement.className = 'w-full h-full object-contain hover:opacity-90 transition-opacity duration-300';
          imgElement.loading = 'lazy';
          imgElement.onerror = () => {
            // Fallback to placeholder if image fails to load
            imgElement.src = '/images/placeholder.jpg';
          };
          
          // Add image to item
          itemDiv.appendChild(imgElement);
          
          // Add item to gallery
          galleryContainer.appendChild(itemDiv);
        });
        
        // Replace the gallery placeholder with the actual gallery
        gallery.appendChild(galleryContainer);
        
      } catch (error) {
        console.error('Error processing gallery:', error);
        // Create a fallback message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'text-red-500 p-4 border border-red-300 rounded';
        errorMessage.textContent = 'Error loading gallery';
        gallery.appendChild(errorMessage);
      }
    });
    
    // Process modal images
    const modalImages = document.querySelectorAll('img[data-modal="true"]');
    modalImages.forEach(img => {
      const imgElement = img as HTMLImageElement;
      let src = imgElement.getAttribute('data-modal-src') || '';
      const alt = imgElement.getAttribute('data-modal-alt') || '';
      
      // Fix any invalid src values
      if (!src || src === 'undefined' || src === 'null') {
        console.warn('Invalid modal image src, using placeholder');
        src = '/images/placeholder.jpg';
        imgElement.setAttribute('data-modal-src', src);
        imgElement.src = src;
      }
      
      // Add error handler to image
      imgElement.onerror = () => {
        console.warn('Image failed to load, using placeholder');
        const placeholderSrc = '/images/placeholder.jpg';
        imgElement.src = placeholderSrc;
        imgElement.setAttribute('data-modal-src', placeholderSrc);
      };
      
      // Add click handler
      imgElement.onclick = () => {
        if (customWindow.imageModal && src) {
          customWindow.imageModal.open(src, alt);
        }
      };
      
      // Add keyboard handler
      imgElement.onkeydown = (e) => {
        if (e.key === 'Enter' && customWindow.imageModal && src) {
          customWindow.imageModal.open(src, alt);
        }
      };
      
      // Add accessibility attributes
      imgElement.tabIndex = 0;
      imgElement.role = 'button';
      imgElement.setAttribute('aria-label', `View ${alt || 'image'} in full size`);
    });
  });
</script>

<svelte:head>
  <title>{data.title} | Ian Wilson</title>
  <meta name="description" content={data.description} />
</svelte:head>

<!-- Markdown-based blog post -->
{#if isMarkdown && content}
  {@const Component = content}
  <Component {...metadata} />
{:else if post}
  <!-- Database-backed blog post using BlogLayout -->
  <BlogLayout
    title={post.title}
    date={post.publishedAt || post.createdAt}
    description={post.excerpt || ''}
    tags={post.tags?.map(tag => tag.name) || []}
    coverImage={post.coverImage?.path || null}
    readingTime={Math.ceil((post.content?.length || 0) / 1500)}
  >
    <div>
      {@html parseMarkdown(post.content || '')}
    </div>
    
    <!-- Image modal for full-size viewing -->
    <ImageModal />
  </BlogLayout>
{/if}
