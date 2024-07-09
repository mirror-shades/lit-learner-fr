<script lang="ts">
  import ActiveReading from "./ActiveReading.svelte";
  import Writer from "./Writer.svelte";
  import { fullText, translation } from "../lib/store";
  import Message from "./icons/Message.svelte";
  import Reader from "./Reader.svelte";
</script>

<main>
  <div class="flex py-[200px] place-items-center h-screen w-full">
    <div class="grid w-[50%]">
      <Reader />
    </div>
    <div class="divider divider-horizontal"></div>
    <div
      class="flex flex-col w-[50%] text-center justify-center items-center mx-auto"
    >
      <ActiveReading />
    </div>
    <div class="divider divider-horizontal"></div>
    <div class="grid h-20 mr-2 w-[50%] flex-grow place-items-center">
      <Writer />
    </div>
  </div>
</main>
