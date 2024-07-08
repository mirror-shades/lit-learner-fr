<script lang="ts">
    export let script: string[] = [];
    export let translation: string[] = [];
</script>

<div class="flex flex-col w-[75%] text-center justify-center items-center mx-auto"> 
    <textarea disabled class="h-[60%]">
        {#each translation as chunk, index}
        <div class="card m-2 ml-4 p-2 bg-slate-700 overflow-y-auto w-full">
            <p class="italic">{script[index]}</p>
            <p>{chunk}</p>
        </div>
        <div class="mt-[8px]"></div>
        {/each}
    </textarea>
</div>