<script lang="ts">
  import AudioPlayer from "./AudioPlayer.svelte";
  import { index, fullText } from "../lib/store";
</script>

<main>
  {#if $fullText[$index]}
    <p class="card p-2 bg-secondary">{$fullText[$index]}</p>
    <AudioPlayer input={$fullText[$index]} />
  {/if}
</main>
