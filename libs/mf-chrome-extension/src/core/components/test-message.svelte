<script lang="ts">
  export let isError = false;

  export let messageText = '';

</script>

{#if messageText}
  <div class="form__messages">
    {#if isError}
      <span class="form-message form-message--error">
        <i class="material-icons md-dark">
          error_outline
        </i>
        {messageText}
      </span>
    {:else}
      <span class="form-message form-message--success">
        <i class="material-icons md-dark">
          check_circle
        </i>
        {messageText}
      </span>
    {/if}
  </div>
{/if}

<style lang="scss">
  .form {
    &__messages {
      margin-bottom: 15px;
    }

    &-message {
      margin-top: 5px;
    }
  }
</style>
