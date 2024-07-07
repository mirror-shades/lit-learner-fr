<script>
  import { onMount } from 'svelte';
  let foo1Text = "Short text";
  let foo2Text = "Another short text";

  // Update text dynamically for demonstration purposes
  onMount(() => {
      setTimeout(() => {
          foo1Text = "This is an updated text which is significantly longer to test the layoutThis is an updated text which is significantly longer to test the layoutThis is an updated text which is significantly longer to test the layoutThis is an updated text which is significantly longer to test the layoutThis is an updated text which is significantly longer to test the layout";
      }, 3000);

      setTimeout(() => {
          foo2Text = "This is another updated text which is much longer";
      }, 6000);
  });
</script>

<div class="container relative min-h-screen flex items-center justify-center">
  <div class="content-wrapper text-center">
      <div class="foo1 mb-4">
          {foo1Text}
      </div>
      <div class="foo2 mt-4">
          {foo2Text}
      </div>
  </div>
  <div class="black-rectangle bg-black w-32 h-16 absolute"></div>
</div>