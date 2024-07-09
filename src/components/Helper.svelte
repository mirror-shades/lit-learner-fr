<script>
  export let messages = [];
  let newMessageText = "";
</script>

<div class="chat-log mb-4 p-4 bg-gray-100 rounded-lg h-64 overflow-y-auto">
  {#if messages}
    {#each messages as message}
      <div class="message mb-2 p-2 bg-gray-200 rounded">
        <strong>{message.sender}:</strong>
        {message.text}
      </div>
    {/each}
  {/if}
</div>

<style>
  .chat-container {
    max-width: 600px;
    margin: auto;
  }
</style>
