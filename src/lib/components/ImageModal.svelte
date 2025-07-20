<script lang="ts">
  /// <reference lib="dom" />
  
  // Image modal component for displaying full-size images
  // Using Svelte 5 runes
  let isOpen = $state(false);
  let currentImage = $state('');
  let altText = $state('');
  
  // Type augmentation for Window interface
  interface CustomWindow extends Window {
    imageModal?: {
      open: (imageUrl: string, alt?: string) => void;
      close: () => void;
    };
  }
  
  // Open the modal with a specific image
  function openModal(imageUrl: string, alt: string = '') {
    currentImage = imageUrl;
    altText = alt;
    isOpen = true;
    document.body.classList.add('overflow-hidden'); // Prevent scrolling when modal is open
  }
  
  // Close the modal
  function closeModal() {
    isOpen = false;
    document.body.classList.remove('overflow-hidden');
  }
  
  // Handle keyboard events (Escape to close)
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  }
  
  // Register the modal globally so it can be accessed from anywhere
  if (typeof window !== 'undefined') {
    (window as CustomWindow).imageModal = {
      open: openModal,
      close: closeModal
    };
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-all duration-300"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    aria-label="Image preview"
    tabindex="0"
  >
    <!-- Close button -->
    <button 
      class="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
      onclick={(e) => { e.stopPropagation(); closeModal(); }}
      aria-label="Close modal"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Modal content -->
    <div 
      class="max-w-screen-xl max-h-screen overflow-auto"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <img 
        src={currentImage} 
        alt={altText} 
        class="max-w-full max-h-[90vh] object-contain mx-auto"
      />
      
      {#if altText}
        <div class="text-center text-white mt-2 px-4 py-2 bg-black bg-opacity-50 rounded">
          {altText}
        </div>
      {/if}
    </div>
  </div>
{/if}
