<script lang="ts">

const sitekey = process.env.TURNSTILE_SITE_KEY;

</script>

<div
  class="cf-turnstile"
  data-sitekey="{sitekey}"
  data-callback="javascriptCallback"
></div>