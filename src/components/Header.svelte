<script lang="ts">
  import { story } from "../lib/store";
  let menuOpen: boolean = false;
</script>

<div class="absolute navbar bg-base-100">
  <div class="flex-none">
    <button
      on:click={() => {
        menuOpen = !menuOpen;
      }}
      class="btn btn-square btn-ghost"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="inline-block h-10 w-10 stroke-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        ></path>
      </svg>
    </button>
  </div>
</div>

{#if menuOpen}
  <ul class=" absolute menu mt-16 bg-base-200 rounded-box w-56">
    <details>
      <summary>French</summary>
      <ul>
        <li>
          <button
            on:click={() => {
              story.set("chickenLittle");
            }}>Chicken Little</button
          >
        </li>
        <li>
          <button
            on:click={() => {
              story.set("littleRed");
            }}>Little Red Riding Hood</button
          >
        </li>
        <li>
          <button
            on:click={() => {
              story.set("uglyDuckling");
            }}>The Ugly Ducking</button
          >
        </li>
      </ul>
    </details>
  </ul>
{/if}
