<script lang="ts">
  import Reader from "./Reader.svelte";
  import OpenAI from "openai";
  import { story } from "./assets/story";
  import Header from "./Header.svelte";

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });

  const fullText = story;
  let thinking: boolean = false;
  let difficulty: number = 8;
  let input: string = "";
  let lastGuess: string = "";
  let advice: string = "";
  let rating: number = 0;
  let currentText: string = fullText[0];
  let translation: string[] = [];
  let index: number = 0;
  let model: string = "gpt-4o";
  let analysisContext: string =
    "You are a friendly french teacher. You will receive a french sentence, and the attempted translation by a student. Tell the student if they did well or not. Only respond in English. Keep your responses short and conversational. do not grade on punctuation  or capital letters.";
  let ratingContext: string =
    "Translate this grade to a number between 1 and 10. only reply with a number in digit form, nothing more. if there is no advice to give, and it is considered an accurate translation, give 10. if there is not translation included it is a 1.";
  const endIndex: number = fullText.length - 1;

  async function AI() {
    thinking = true;
    let unformattedMessage = currentText + " | Translation: " + input;
    let _advice: string = "";
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
    } catch {}
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
          console.log("Not a number")
        }
      }
    } catch {}

    advice = _advice;
    lastGuess = _lastGuess;
    rating = _rating;
    thinking = false;
    return rating >= difficulty;
  }

  async function run() {
    let success = true;
    if (!thinking && input) {
      success = await AI();
    console.log(index, endIndex, success);
    if (index < endIndex && success) {
      currentText = fullText[index + 1];
      translation = [...translation, input];
      input = "";
      index++;
    }
    } else {
      // thinking = true;
    }
    console.log(translation)
  }

  function handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && thinking === false) {
      event.preventDefault();
      run();
    }
  }
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
    <div class="grid text-center w-[50%]"> 
      <p class="card bg-slate-700 text-white">{currentText}</p>
    </div>
    <div class="divider divider-horizontal"></div>
    <div class="grid h-20 w-[50%] flex-grow place-items-center">
      <div class="rating">
        <input type="radio" value={1} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={5} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={8} bind:group={difficulty} name="difficulty" class="mask mask-star" />
      </div>
      <div class="flex p-2 place-item-center">
        <textarea disabled={thinking} class="h-12 w-96" bind:value={input} on:keydown={handleEnterPress} name="input" id="input"></textarea>
      </div>
      <div class="w-96">
        {#if thinking}


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