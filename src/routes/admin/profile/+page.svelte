<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  
  // Form state
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let email = $state($page.data.user?.email || '');
  let name = $state($page.data.user?.name || '');
  
  // Form validation and submission state
  let formError = $state('');
  let formSuccess = $state(false);
  let isSubmitting = $state(false);
  
  // Password validation
  const validatePassword = () => {
    if (newPassword && newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return '';
  };
  
  // Form submission handler
  const handleSubmit = () => {
    // Reset error state
    formError = '';
    
    // Basic validation
    if (!currentPassword) {
      formError = 'Current password is required';
      return;
    }
    
    // If changing password, validate
    if (newPassword || confirmPassword) {
      const passwordError = validatePassword();
      if (passwordError) {
        formError = passwordError;
        return;
      }
    }
    
    // Email validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      formError = 'Please enter a valid email address';
      return;
    }
    
    isSubmitting = true;
    
    // Return the enhance action
    return async ({ result }: { result: { type: string; data?: { error?: string } } }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        formSuccess = true;
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          formSuccess = false;
        }, 5000);
      } else if (result.type === 'failure') {
        formError = result.data?.error || 'An error occurred while updating your profile';
      }
    };
  };
</script>

<svelte:head>
  <title>Admin Profile | Ian Wilson</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-8">Admin Profile</h1>
  
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
            Your profile has been updated successfully!
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
  
  <div class="bg-white rounded-lg shadow-lg p-6">
    <form method="POST" use:enhance={handleSubmit} class="space-y-6">
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
      
      <div class="border-t border-gray-200 pt-6">
        <h2 class="text-lg font-medium mb-4">Change Password</h2>
        
        <!-- Current Password -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            bind:value={currentPassword}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        
        <!-- New Password -->
        <div class="mt-4">
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            bind:value={newPassword}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <p class="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>
        
        <!-- Confirm Password -->
        <div class="mt-4">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            bind:value={confirmPassword}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      
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
            Updating...
          {:else}
            Update Profile
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
