<script lang="ts">
  import OpenAI from "openai";
  import { translation, fullText } from "../lib/store";
  import Message from "./icons/Message.svelte";

  let model = "gpt-4o";

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });
</script>

<div
  class="flex flex-col w-[75%] text-center justify-center items-center mx-auto"
>
  {#each $translation as chunk, index}
    <div class="card m-2 ml-4 p-2 bg-secondary overflow-y-auto w-full">
      <p class="italic">{$fullText[index]}</p>
      <p>{chunk}</p>
      <Message />
    </div>
    <div class="mt-[8px]"></div>
  {/each}
</div>
