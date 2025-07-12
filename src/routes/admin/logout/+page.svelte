<script>
  import { onMount } from 'svelte';

  // Automatically submit the form when the page loads
  onMount(() => {
    const form = document.getElementById('logout-form');
    if (form && form instanceof HTMLFormElement) {
      form.submit();
    }
  });
</script>

<div class="logout-container">
  <h1>Logging out...</h1>
  <p>Please wait while we log you out.</p>
  
  <!-- Hidden form that will be auto-submitted -->
  <form id="logout-form" method="POST" action="?/default">
    <!-- No form fields needed -->
  </form>
</div>

<style>
  .logout-container {
    max-width: 400px;
    margin: 100px auto;
    padding: 20px;
    text-align: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
  }
</style>
