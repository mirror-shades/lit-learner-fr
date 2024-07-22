<script lang="ts">
  import { writable } from "svelte/store";
  import OpenAI from "openai";
  import { translation, fullText, helperHistory, index } from "../lib/store";
  import Message from "./icons/Message.svelte";
  import Helper from "./Helper.svelte";
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
  import { get } from "svelte/store";

  let input = "";
  let modals = writable(
    new Map<
      number,
      { show: boolean; messages: { text: string; sender: string }[] }
    >()
  );

  let model = "gpt-4o";

  const API = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: API, dangerouslyAllowBrowser: true });

  const updateModals = (
    index: number,
    updateFn: (modal: {
      show: boolean;
      messages: { text: string; sender: string }[];
    }) => void
  ) => {
    modals.update((map) => {
      const modal = map.get(index) || { show: false, messages: [] };
      updateFn(modal);
      map.set(index, modal);
      return map;
    });
  };

  const sendHelperMessage = async (chunk: any, idx: number) => {
    const history = get(helperHistory).get(idx) || [];
    const aiPrompt = `text: ${$fullText[idx]}, translation: ${chunk}`;

    const formattedMessage: ChatCompletionMessageParam[] = [
      { role: "system", content: aiPrompt },
      ...history.map(({ text, sender }) => ({
        role: sender === "You" ? "user" : "assistant",
        content: text,
      })),
      { role: "user", content: input },
    ];

    const reply = await fetchAIResponse(formattedMessage);

    if (typeof reply === "string") {
      updateModals(idx, (modal) => {
        modal.messages.push({ text: input, sender: "You" });
        modal.messages.push({ text: reply, sender: "Helper" });
        setHelperHistory(idx, modal.messages);
      });
      input = "";
    }
  };

  const setHelperHistory = (index: number, value: any) => {
    helperHistory.update((map) => {
      map.set(index, value);
      return map;
    });
  };

  const fetchAIResponse = async (messages: ChatCompletionMessageParam[]) => {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages,
    });
    return completion.choices[0].message.content;
  };

  const toggleModal = (index: number) => {
    updateModals(index, (modal) => {
      modal.show = !modal.show;
      if (modal.show) {
        modal.messages = get(helperHistory).get(index) || [];
      }
    });
  };
</script>

<div
  class="flex flex-col w-[75%] text-center justify-center items-center mx-auto"
>
  {#each $translation as chunk, idx}
    <div class="card m-2 ml-4 p-2 bg-secondary overflow-y-auto w-full">
      <p class="italic">{$fullText[idx]}</p>
      <p>{chunk}</p>
      <button
        class="btn btn-circle btn-ghost btn-sm"
        on:click={() => toggleModal(idx)}
      >
        <Message />
      </button>

      {#if $modals.get(idx)?.show}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <dialog
          open
          class="modal"
          on:click={(e) => e.target.tagName === "DIALOG" && toggleModal(idx)}
        >
          <div class="modal-box">
            <div class="chat-container p-4 bg-white rounded-lg shadow-lg">
              <p class="italic">{$fullText[idx]}</p>
              <p>{chunk}</p>
              <br />
              <Helper messages={$modals.get(idx)?.messages} />
              <div class="input-group flex items-center">
                <textarea
                  class="textarea h-16 border-gray-300 rounded-lg p-2 flex-grow mr-2"
                  bind:value={input}
                  rows="3"
                  placeholder="Type a message..."
                />
                <button
                  class="btn btn-primary"
                  on:click={() => sendHelperMessage(chunk, idx)}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <form
            method="dialog"
            class="modal-backdrop"
            on:click={() => toggleModal(idx)}
          >
            <button type="button">close</button>
          </form>
        </dialog>
      {/if}
    </div>
    <div class="mt-[8px]"></div>
  {/each}
</div>
