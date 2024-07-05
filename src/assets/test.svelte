<script lang="ts">
  export let script: string[] = [];
  export let place: number = 0;
  console.log(script);
</script>

<style>
  .text-container {
    position: relative;
    height: 200px; /* Set according to your needs */
    overflow: hidden;
  }

  .text-fade-out {
    position: relative;
    padding-bottom: 40px; /* Adjust according to the gradient */
    overflow-y: auto;
  }

  .text-fade-out::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px; /* Adjust according to the gradient */
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
  }
  
  .highlight {
    background-color: black;
    color: white;
  }
</style>

<div class="text-container">
  <div class="text-fade-out">
    {#each script as chunk, index}
      {#if index === place}
        <p class="highlight">{chunk}</p>
      {:else}
        <p>{chunk}</p>
      {/if}
    {/each}
  </div>
</div>