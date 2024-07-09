<script lang="ts">
  import {
    chickenLittle,
    littleRed,
    uglyDuckling,
    story,
    fullText,
  } from "../lib/store";
  import Burger from "./icons/Burger.svelte";
  let menuOpen: boolean = false;
  let menuColor: string = "";
</script>

<div class="absolute navbar">
  <div class="flex-none">
    <button
      on:click={() => {
        if (menuOpen) {
          menuOpen = !menuOpen;
          menuColor = "";
        } else {
          menuOpen = !menuOpen;
          menuColor = "bg-secondary";
        }
      }}
      class="btn btn-square btn-ghost {menuColor}"
    >
      <Burger />
    </button>
  </div>
</div>

{#if menuOpen}
  <ul class=" absolute menu ml-2 mt-12 bg-secondary rounded-box w-56">
    <details>
      <summary>French</summary>
      <ul>
        <li>
          <button
            on:click={() => {
              story.set("chickenLittle");
              fullText.set(chickenLittle);
            }}>Chicken Little</button
          >
        </li>
        <li>
          <button
            on:click={() => {
              story.set("littleRed");
              fullText.set(littleRed);
            }}>Little Red Riding Hood</button
          >
        </li>
        <li>
          <button
            on:click={() => {
              story.set("uglyDuckling");
              fullText.set(uglyDuckling);
            }}>The Ugly Ducking</button
          >
        </li>
      </ul>
    </details>
  </ul>
{/if}
