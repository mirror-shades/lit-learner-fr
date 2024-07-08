<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import Reader from "./Reader.svelte";
  import OpenAI from "openai";
  import { story } from "../lib/store";
  import { chickenLittle, littleRed, uglyDuckling } from "../assets/stories";
  import type { StoryKey } from "../types";
  import speaker from "../assets/Speaker_Icon.png";
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

  // Constants
  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });
  const stories: Record<StoryKey, string[]> = {
    chickenLittle,
    littleRed,
    uglyDuckling,
  };
  const analysisContext =
    "You are a friendly french teacher. You will receive a french sentence, and the attempted translation by a student. Tell the student if they did well or not. Only respond in English. Keep your responses short and conversational. Do not grade on punctuation or capital letters.";
  const ratingContext =
    "Translate this grade to a number between 1 and 10. Only reply with a number in digit form, nothing more. If there is no advice to give, and it is considered an accurate translation, give 10. If there is no translation included, it is a 1.";

  // State Variables
  let fullText: string[] = chickenLittle;
  let isThinking = false;
  let isSpeaking = false;
  let difficulty = 8;
  let input = "";
  let lastGuess = "";
  let advice: string | null = "";
  let rating = 0;
  let currentText: string = fullText[0];
  let translation: string[] = [];
  let index = 0;
  let speakingActive = false;
  let model = "gpt-4o";
  let textareaRef: HTMLTextAreaElement;
  const endIndex = fullText.length - 1;
  let voices: any = [];
  let selectedVoice: any = null;
  const apiEndpoint = "https://88b98r.buildship.run/response";
  let isLoadingAudio = false;
  let adviceAudio: string = "";
  let currentAudio: string = "";
  let audioElement: HTMLAudioElement;

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

  async function toggleSpeaking() {
    speakingActive = !speakingActive;
    console.log("Speaking is now:", speakingActive);
    if (speakingActive) {
      currentAudio = await speak(currentText);
      console.log("Current Audio URL:", currentAudio);
    }
  }

  const fetchAIResponse = async (messages: ChatCompletionMessageParam[]) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages,
    });
    return completion.choices[0].message.content;
  };

  async function AI() {
    isThinking = true;
    const unformattedMessage = `${currentText} | Translation: ${input}`;
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
            content: `${ratingContext} Here is the text to translate: ${currentText}`,
          },
          { role: "user", content: input },
        ];
        const _srating = await fetchAIResponse(formattedMessage);
        _rating = Number(_srating) || 0;
      }
    } catch {}

    advice = _advice;
    lastGuess = _lastGuess;
    rating = _rating;
    isThinking = false;
    return rating >= difficulty;
  }

  async function run() {
    if (!isThinking && input) {
      const success = await AI();
      if (index < endIndex) {
        if (success) {
          currentText = fullText[index + 1];
          translation = [...translation, input];
          input = "";
          index++;
          adviceAudio = await speak(advice + ". Let's try the next sentence.");
          currentAudio = await speak(currentText);
        } else {
          adviceAudio = await speak(String(advice));
        }
      }
    }
  }

  function handleEnterPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !isThinking) {
      event.preventDefault();
      run();
    }
  }

  $: {
    if (audioElement && currentAudio) {
      audioElement.load(); // Ensures the new URL is loaded
      audioElement.play(); // Auto-play the new audio
    }
  }

  onMount(async () => {
    fullText = stories[$story as StoryKey] || [];
    currentText = fullText[0];
    translation = [];
    currentAudio = await speak(currentText);
  });

  afterUpdate(() => {
    textareaRef.focus();
  });
</script>

<main>
  <div class="flex py-[200px] place-items-center h-screen w-full">
    <div class="grid w-[50%]">
      <Reader {translation} script={fullText} />
    </div>
    <div class="divider divider-horizontal"></div>
    <div
      class="flex flex-col w-[50%] text-center justify-center items-center mx-auto"
    >
      <p class="card p-2 w-[75%] bg-slate-700 text-white">{currentText}</p>
      <audio bind:this={audioElement} controls>
        {#if currentAudio}
          <source src={currentAudio} type="audio/mpeg" />
        {:else}
          <p>Your browser does not support the audio element.</p>
        {/if}
      </audio>
    </div>
    <div class="divider divider-horizontal"></div>
    <div class="grid h-20 mr-2 w-[50%] flex-grow place-items-center">
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
        <img src={speaker} class="w-7 mx-2" alt="Speaker Icon" />
        <input
          type="checkbox"
          on:change={toggleSpeaking}
          checked={speakingActive}
          class="checkbox h-6 w-6"
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
        {:else if advice}
          <div>
            <audio bind:this={audioElement} controls>
              {#if adviceAudio}
                <source src={adviceAudio} type="audio/mpeg" />
              {:else}
                <p>Your browser does not support the audio element.</p>
              {/if}
            </audio>
            <h1>You said:</h1>
            {lastGuess}
            <h1>Rating:</h1>
            {rating}
            <br />
            {advice}
            {#if rating < difficulty}
              <p>Try again!</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  h1 {
    font-weight: bold;
  }
</style>
