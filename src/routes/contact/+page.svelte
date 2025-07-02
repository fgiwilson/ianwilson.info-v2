<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';

  
  // Form state
  let name = $state('');
  let email = $state('');
  let subject = $state('');
  let message = $state('');
  let consultingInterest = $state(false);
  
  // Form validation and submission state
  let formError = $state('');
  let formSuccess = $state(false);
  let isSubmitting = $state(false);
  
  // Reset form after successful submission
  function resetForm() {
    name = '';
    email = '';
    subject = '';
    message = '';
    isSubmitting = false;
  }
  
  // Form submission handler
  const handleSubmit = () => {
    // Reset error state
    formError = '';
    
    // Basic validation
    if (!name.trim()) {
      formError = 'Please enter your name';
      return;
    }
    
    if (!email.trim()) {
      formError = 'Please enter your email address';
      return;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      formError = 'Please enter a valid email address';
      return;
    }
    
    if (!message.trim()) {
      formError = 'Please enter a message';
      return;
    }
    
    isSubmitting = true;
    
    // Return the enhance action
    return async ({ result, update }: { result: any, update: Function }) => {
      if (result.type === 'success') {
        formSuccess = true;
        resetForm();
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          formSuccess = false;
        }, 5000);
      } else {
        formError = 'There was an error sending your message. Please try again.';
        isSubmitting = false;
      }
    };
  };
</script>

<svelte:head>
  <title>Contact | Ian Wilson</title>
  <meta name="description" content="Get in touch with Ian Wilson for project inquiries, collaborations, or questions." />
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

<section class="py-16 bg-background">
  <div class="container mx-auto px-4 max-w-3xl">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8">
      <span class="text-primary">Get in </span>
      <span class="text-accent">Touch</span>
    </h1>
    
    <p class="text-xl text-center text-text-light mb-12">
      Have a project in mind or want to discuss a collaboration? Fill out the form below and I'll get back to you as soon as possible.
    </p>
    
    <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
      {#if formSuccess}
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">
                Thank you for your message! I'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      {/if}
      
      {#if formError}
        <div class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">{formError}</p>
            </div>
          </div>
        </div>
      {/if}
      
      <form method="POST" use:enhance={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              bind:value={name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Your name"
              required
            />
          </div>
          
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              bind:value={email}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>
        
        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            bind:value={subject}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="What is this regarding?"
            required
          />
        </div>
        
        <!-- Message -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            bind:value={message}
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Your message here..."
            required
          ></textarea>
        </div>
        
        <!-- Consulting Interest Checkbox -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="consultingInterest"
            name="consultingInterest"
            bind:checked={consultingInterest}
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="consultingInterest" class="ml-2 block text-sm text-gray-700">
            I'm interested in consulting services
          </label>
        </div>
        
        <div class="g-recaptcha" data-sitekey="6LfFpXQrAAAAAL-0Q2HeOFxzkygUbTatd6Lw49lI"></div>
        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isSubmitting}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            {:else}
              Send Message
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</section>
