<script lang="ts">
  import Play from "./icons/Play.svelte";
  import Stop from "./icons/Stop.svelte";
  import Thinking from "./icons/Thinking.svelte";

  export let input: string;
  const apiEndpoint = "https://88b98r.buildship.run/response";
  let currentAudio: string = "";
  let audio: HTMLAudioElement | null = null;
  let isPlaying = false;
  let isLoadingAudio = false;
  let isThinking = false;

  $: {
    if (currentAudio && (!audio || audio.src !== currentAudio)) {
      audio = new Audio(currentAudio);
      audio.onended = () => (isPlaying = false);
    }
  }

  async function togglePlay() {
    if (isPlaying && audio) {
      audio.pause();
    } else {
      isThinking = true;
      if (!audio || audio.src !== currentAudio) {
        currentAudio = await speak(input);
      }
      audio = new Audio(currentAudio);
      isThinking = false;
      audio.onended = () => (isPlaying = false);
      audio.play();
    }
    isPlaying = !isPlaying;
  }

  async function speak(prompt: string): Promise<string> {
    let responseText = "";
    try {
      isLoadingAudio = true;
      const response = await fetch(
        `${apiEndpoint}?prompt=${encodeURIComponent(prompt)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Log the entire response to check for issues
      console.log("API Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      responseText = await response.text();
      console.log("Response Text:", responseText); // Log output to see what the response is

      if (!response.ok) {
        throw new Error("Failed to fetch audio URL");
      }
    } catch (err) {
      console.error("Error fetching audio:", err);
    } finally {
      isLoadingAudio = false;
      return responseText;
    }
  }
</script>

<button on:click={togglePlay} class="btn btn-sm btn-ghost btn-circle">
  {#if isPlaying}
    <Stop />
  {:else if isThinking}
    <Thinking />
  {:else}
    <Play />
  {/if}
</button>
