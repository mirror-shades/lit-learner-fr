<script lang="ts">
    export let script: string[] = [];
    export let place: number = 0;
  
    let currentText: string = script[place] || '';
    let previousText: string[] = [];
    let futureText: string[] = [];
  
    $: {
      currentText = script[place] || '';
      previousText = script.slice(Math.max(place - 7, 0), place);
      futureText = script.slice(place + 1, place + 8);
    }
  </script>
  
  {#each previousText as chunk, index}
    <p>{chunk}</p>
  {/each}
  
  <p class="bg-black text-white">{currentText}</p>
  
  {#each futureText as chunk, index}
    <p>{chunk}</p>
  {/each}