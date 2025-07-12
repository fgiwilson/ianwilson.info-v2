<script lang="ts">
  import { enhance } from '$app/forms';
  
  let email = '';
  let password = '';
  let error = '';
  
  // Form submission handler using enhance for progressive enhancement
  const handleEnhance = () => {
    return async ({ result }: { result: any }) => {
      if (result.type === 'failure') {
        error = result.data?.message || 'Login failed. Please check your credentials.';
      }
      
      if (result.type === 'redirect') {
        // Let the browser handle the redirect
        window.location.href = '/admin';
      }
    };
  };
</script>

<svelte:head>
  <title>Admin Login | Ian Wilson</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Admin Login
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your credentials to access the admin dashboard
      </p>
    </div>
    
    {#if error}
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <form method="POST" use:enhance={handleEnhance as any} class="mt-8 space-y-6">
      <div class="-space-y-px rounded-md shadow-sm">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            class="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>
