<script lang="ts">
    export let script: string[] = [];
    export let translation: string[] = [];
</script>

<div class="flex flex-col text-center items-center justify-center overflow-hidden">
        {#each translation as chunk, index}
        <div class="card bg-slate-700 overflow-y-auto w-full">
            <p class="italic">{script[index]}</p>    
            <p>{chunk}</p>
        </div>
        <div class="mt-[8px]"></div>
        {/each}
</div>