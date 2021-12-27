<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
  import { form } from 'svelte-forms';
  import TestMessage from '../core/components/test-message.svelte';
  import { testDefinitionUriForm } from '../core/validators/definition-uri-form-validator';

  const dispatch = createEventDispatcher();

  let uri = '';

  let definitionUriForm;

  let messageText: string = null;

  let isError = false;

  onMount(() => {
    definitionUriForm = form(() => ({
      uri: {
        value: uri,
        validators: ['required']
      }
    }),
      {
        validateOnChange: false
      }
    );
  });

  afterUpdate(() => {
    definitionUriForm.validate();
  });

  /**
   *
   */
   function showSuccess(text: string) {
    isError = false;
    messageText = text;
  }

  /**
   *
   */
  function showError(error: Error) {
    isError = true;
    messageText = error.message;
  }

  /**
   *
   */
  function hideMessage() {
    isError = false;
    messageText = null;
  }

  /**
   *
   */
  function onClearForm() {
    uri = '';
    hideMessage();
  }

  /**
   *
   */
   function onTestForm() {
    hideMessage();

    testDefinitionUriForm(uri)
      .then((message) => {
        showSuccess(message);
      })
      .catch((validation) => {
        showError(validation);
      });
  };

  /**
   *
   */
  function onSubmitForm() {
    dispatch('submit', uri);
  }

</script>

<div class="form">
  <div class="form-group">
    <label class="form-label"
           for="uri">
      Definition URI
    </label>
    <input type="text"
           id="uri"
           class="input"
           bind:value={uri}>
  </div>

  <TestMessage isError={isError}
               messageText={messageText}/>

  <div class="form__actions">
    <div class="form__actions-left">
      <button type="button"
              class="{!$definitionUriForm?.valid ? 'button button--disabled' : 'button button--default'}"
              disabled={!$definitionUriForm?.valid}
              on:click={onTestForm}>
        <span class="material-icons md-dark">
          bug_report
        </span>
        Test
      </button>
    </div>
    <div class="form__actions-right">
      <button type="button"
              class="button button--default"
              on:click={onClearForm}>
        <span class="material-icons md-dark">
          clear
        </span>
        Clear
      </button>

      <button type="button"
              class="{!$definitionUriForm?.valid ? 'button button--disabled' : 'button button--blue'}"
              disabled={!$definitionUriForm?.valid}
              on:click={onSubmitForm}>
        <span class="material-icons md-dark">
          get_app
        </span>
        Load
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .form {
    width: 500px;

    &__actions {
      display: flex;
      justify-content: space-between;

      &-left {
        align-self: flex-start;
      }
    }

    .input {
      width: 100%;
    }
  }
</style>
