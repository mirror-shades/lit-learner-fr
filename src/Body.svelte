<script lang="ts">
  import Reader from "./Reader.svelte";
  import OpenAI from "openai";
  import { story } from "./assets/story"

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });

  const fullText = story;
  let complete = false;
  let difficulty = 8;
  let input = "";
  let lastGuess = "";
  let advice: string = "";
  let rating: number = 0;
  let currentText = fullText[0];
  let index = 10; 
  let model: string = "gpt-4o";
  let analysisContext: string =
    "You are a friendly french teacher. You will receive a french sentence, and the attempted translation by a student. Tell the student if they did well or not. Keep your responses short and conversational.";
  let ratingContext: string =
    "Give a rating of this translation from french to english between 1 and 10. only reply with a number in digit form, nothing more.";
  const endIndex = fullText.length-1;



  async function AI() {
    const unformattedMessage = currentText + " | " + input
    let _advice: string = "";
    let _lastGuess = input;
    try{
      let formattedMessage = [
          { role: "system", content: analysisContext },
          { role: "user", content: unformattedMessage }
      ];
      let completion = await openai.chat.completions.create({
            model: model,
            messages: formattedMessage,
          });
      _advice= String(completion.choices[0].message.content);
    } catch {

    }
    let pass = "true";
    let _srating: string | null = "";
    let _rating: number = 0;
    try {
      while(_rating <=0 || _rating > 10) {
        let formattedMessage = [
            { role: "system", content: ratingContext },
            { role: "user", content: unformattedMessage }
        ];
        let completion = await openai.chat.completions.create({
              model: model,
              messages: formattedMessage,
            });
        _srating = completion.choices[0].message.content;
        try{
          _rating = Number(_srating);
        } catch {

        }
      }
    } catch {

    }
    advice = _advice;
    lastGuess = _lastGuess;
    rating = _rating;
    return(rating >= difficulty);
  }


  async function run(){
    let success = true;
    if(!complete) {
      success = await AI();
    }
    console.log(index, endIndex, success)
    if(index<endIndex && success){
      currentText = fullText[index+1];
      index++
    } else {
      //complete = true;
    }
  }
  
  function handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && complete === false) {
      event.preventDefault();
      run();
      input = "";
    }
  }

  </script>

  <style>
    h1 {
      font-weight: bold;
    }
  </style>

<main> 
  <div class="flex w-full">

    <!-- fade this vertically, hide the content that goes beyond the page to prevent scrolling -->
    <div class="card grid h-20 flex-grow place-items-center w-[400px]"><Reader place={index} script={fullText}/></div>
    
    <div class="divider divider-horizontal"/>
    <div class="card grid h-20 flex-grow place-items-center">
      <div class="rating">
        <input type="radio" value={1} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={5} bind:group={difficulty} name="difficulty" class="mask mask-star" />
        <input type="radio" value={8} bind:group={difficulty} name="difficulty" class="mask mask-star" />
      </div>
      <div class="p-[8px]">
      <textarea class="h-[50px] w-[400px]" bind:value={input} on:keydown={handleEnterPress} name="input" id="input"></textarea>
      </div>
      <div class="w-[400px]">
        {#if advice}
        <h1>You said: {lastGuess}</h1>
        <h1>Rating: {rating}</h1>
          {advice}
          {#if rating<difficulty}
            <p>Try again!</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</main>

