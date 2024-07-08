<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import Reader from "./Reader.svelte";
  import OpenAI from "openai";
  import { story } from "./lib/store";
  import { chickenLittle, littleRed, uglyDuckling } from "./assets/stories";
  import type { StoryKey } from "../types";
  import speaker from "./assets/Speaker_Icon.png";

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });

  let fullText: string[] = chickenLittle;
  let isthinking: boolean = false;
  let isSpeaking: boolean = false;
  let difficulty: number = 8;
  let input: string = "";
  let lastGuess: string = "";
  let advice: string = "";
  let rating: number = 0;
  let currentText: string = fullText[0];
  let translation: string[] = [];
  let index: number = 0;
  let model: string = "gpt-4o";

  let analysisContext: string = "You are a friendly french teacher. You will receive a french sentence, and the attempted translation by a student. Tell the student if they did well or not. Only respond in English. Keep your responses short and conversational. Do not grade on punctuation or capital letters.";
  
  let ratingContext: string = "Translate this grade to a number between 1 and 10. Only reply with a number in digit form, nothing more. If there is no advice to give, and it is considered an accurate translation, give 10. If there is no translation included, it is a 1.";

  const endIndex: number = fullText.length - 1;
  
  let textareaRef: HTMLTextAreaElement;

  async function AI() {
    isthinking = true;
    let unformattedMessage = currentText + " | Translation: " + input;
    let _advice = "";
    let _lastGuess = input;
    try {
      let formattedMessage = [
        { role: "system", content: analysisContext },
        { role: "user", content: unformattedMessage }
      ];
      let completion = await openai.chat.completions.create({
        model: model,
        messages: formattedMessage
      });
      _advice = String(completion.choices[0].message.content);
    } catch { }

    let _srating: string | null = "";
    let _rating: number = 0;
    try {
      while (_rating <= 0 || _rating > 10) {
        let formattedMessage = [
          { role: "system", content: ratingContext + "Here is the text to translate: " + currentText },
          { role: "user", content: input }
        ];
        let completion = await openai.chat.completions.create({
          model: model,
          messages: formattedMessage
        });
        _srating = completion.choices[0].message.content;
        try {
          _rating = Number(_srating);
        } catch {
          console.log("Not a number");
        }
      }
    } catch { }

    advice = _advice;
    lastGuess = _lastGuess;
    rating = _rating;
    isthinking = false;
    return rating >= difficulty;
  }

  async function run() {
    let success = true;
    if (!isthinking && input) {
      success = await AI();
      console.log(index, endIndex, success);
      if (index < endIndex && success) {
        currentText = fullText[index + 1];
        translation = [...translation, input];
        input = "";
        index++;
      }
    } else {
      // isthinking = true;
    }
    console.log(translation);
  }

  function handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && isthinking === false) {
      event.preventDefault();
      run();
    }
  }

  const stories: Record<StoryKey, string[]> = { chickenLittle, littleRed, uglyDuckling };
  fullText = stories[$story as StoryKey] || [];
  currentText = fullText[0];
  translation = [];

  afterUpdate(() => {
    textareaRef.focus();
  });
</script>

<style>
  h1 {
    font-weight: bold;
  }
</style>

<main>
  <div class="flex py-[200px] place-items-center h-screen w-full">
    <div class="grid w-[50%]"> 
      <Reader translation={translation} script={fullText} />
    </div>
    <div class="divider divider-horizontal"></div>
    <div class="flex flex-col w-[50%] text-center justify-center items-center mx-auto"> 
      <p class="card p-2 w-[75%] bg-slate-700 text-white">{currentText}</p>
    </div>
    <div class="divider divider-horizontal"></div>
    <div class="grid h-20 mr-2 w-[50%] flex-grow place-items-center">
      <div class="rating">
        <input type="radio" value={1} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={5} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={8} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <img src={speaker} class="w-7 mx-2" alt="Speaker Icon">
        <input type="checkbox" checked={isSpeaking} class="checkbox h-6 w-6" />
      </div>
      <div class="flex p-2 place-item-center">
        <textarea disabled={isthinking} class="textarea textarea-bordered h-24 w-96" bind:value={input} on:keydown={handleEnterPress} bind:this={textareaRef} name="input" id="input"></textarea>
      </div>
      <div>
        {#if isthinking}
          <div class="flex items-center justify-center w-full">
            <span class="loading loading-spinner"></span>
          </div>
        {:else}
          {#if advice}
            <h1>You said: {lastGuess}</h1>
            <h1>Rating: {rating}</h1>
            {advice}
            {#if rating < difficulty}
              <p>Try again!</p>
            {/if}
          {/if}
        {/if}
      </div>
    </div>
  </div>
</main>