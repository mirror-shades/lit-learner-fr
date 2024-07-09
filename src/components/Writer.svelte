<script lang="ts">
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
  import { afterUpdate } from "svelte";
  import OpenAI from "openai";
  import AudioPlayer from "./AudioPlayer.svelte";
  import { index, fullText, translation } from "../lib/store";

  const analysisContext =
    "You are a friendly french teacher. You will receive a french sentence, and the attempted translation by a student. Tell the student if they did well or not. Only respond in English. Keep your responses short and conversational. Do not grade on punctuation or capital letters.";
  const ratingContext =
    "Translate this grade to a number between 1 and 10. Only reply with a number in digit form, nothing more. If there is no advice to give, and it is considered an accurate translation, give 10. If there is no translation included, it is a 1.";

  let input = "";
  let isThinking: boolean = false;
  let textareaRef: HTMLTextAreaElement;
  let difficulty = 8;
  let model = "gpt-4o";

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });

  let aiResponse = {
    userGuess: "",
    advice: "",
    rating: 0,
  };

  const fetchAIResponse = async (messages: ChatCompletionMessageParam[]) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages,
    });
    return completion.choices[0].message.content;
  };

  async function AI() {
    isThinking = true;
    const unformattedMessage = `${$fullText[$index]} | Translation: ${input}`;
    let _advice: string | null = "";
    let _lastGuess = input;

    try {
      const formattedMessage: ChatCompletionMessageParam[] = [
        { role: "system", content: analysisContext },
        { role: "user", content: unformattedMessage },
      ];
      _advice = await fetchAIResponse(formattedMessage);
    } catch {}

    let _rating = 0;
    try {
      while (_rating <= 0 || _rating > 10) {
        const formattedMessage: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: `${ratingContext} Here is the text to translate: ${$fullText[$index]}`,
          },
          { role: "user", content: input },
        ];
        const _srating = await fetchAIResponse(formattedMessage);
        _rating = Number(_srating) || 0;
      }
    } catch {}

    aiResponse.advice = String(_advice);
    aiResponse.userGuess = _lastGuess;
    aiResponse.rating = _rating;
    isThinking = false;
    return _rating;
  }

  const run = async () => {
    if (!isThinking && input) {
      try {
        const _rating = await AI();
        const success = _rating >= difficulty;

        if (success) {
          translation.update((n) => [...n, input]);

          input = ""; // reset input

          index.update((n) => n + 1); // increment index
        }
      } catch (error) {
        console.error("AI call failed", error);
      }
    }
  };

  function handleEnterPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !isThinking) {
      event.preventDefault();
      run();
    }
  }

  afterUpdate(() => {
    textareaRef.focus();
  });
</script>

<div class="rating">
  <input
    type="radio"
    value={1}
    bind:group={difficulty}
    name="difficulty"
    class="mask mask-star"
  />
  <input
    type="radio"
    value={5}
    bind:group={difficulty}
    name="difficulty"
    class="mask mask-star"
  />
  <input
    type="radio"
    value={8}
    bind:group={difficulty}
    name="difficulty"
    class="mask mask-star"
  />
</div>
<div class="flex p-2 place-item-center">
  <textarea
    disabled={isThinking}
    class="textarea textarea-bordered h-24 w-96"
    bind:value={input}
    on:keydown={handleEnterPress}
    bind:this={textareaRef}
    name="input"
    id="input"
  ></textarea>
</div>
<div>
  {#if isThinking}
    <div class="flex items-center justify-center w-full">
      <span class="loading loading-spinner"></span>
    </div>
  {:else if aiResponse.advice}
    <div>
      <!-- <AudioPlayer /> -->
      <h1>You said:</h1>
      {aiResponse.userGuess}
      <h1>Rating:</h1>
      {aiResponse.rating}
      <AudioPlayer input={aiResponse.advice} />
      <br />
      {aiResponse.advice}
      {#if aiResponse.rating < difficulty}
        <p>Try again!</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  h1 {
    font-weight: bold;
  }
</style>
