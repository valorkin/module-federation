<script lang="ts">
 	import { createEventDispatcher } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

  import { parseForm } from '../core/validators/form-validator';
  import { testForm } from '../core/validators/test-validator';
  import { configurationObjectJsonTemplate } from '../core/constant'

  export let configuration: ConfigurationObject;

  const dispatch = createEventDispatcher();

  let formText = '';

  let messageText: string = null;

  let submitButtonDisabled = true;

  let isError = false;

  refreshForm(configuration || configurationObjectJsonTemplate);

  /**
   *
   */
  function refreshForm(value: ConfigurationObject) {
    formText = JSON.stringify(value, undefined, 2);
    hideMessage();
    disableSubmitButton();
  }

  /**
   *
   */
  function onInputForm() {
    const validation = parseForm(formText);

    if (validation instanceof Error) {
      showError(validation);
      disableSubmitButton();
      return;
    }

    hideMessage();
    enableSubmitButton();
  };

  /**
   *
   */
  function disableSubmitButton() {
    submitButtonDisabled = true;
  }

  /**
   *
   */
  function enableSubmitButton() {
    submitButtonDisabled = false;
  }

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
    refreshForm(configurationObjectJsonTemplate);
  }

  /**
   *
   */
  function onTestForm() {
    const configuration = parseForm(formText);

    if (configuration instanceof Error) {
      return;
    }

    disableSubmitButton();

    testForm(configuration)
      .then((message) => {
        enableSubmitButton();
        showSuccess(message);
      })
      .catch((validation) => {
        enableSubmitButton();
        showError(validation);
      });
  };

  /**
   *
   */
  function onSubmitForm() {
    const configuration = parseForm(formText);

    if (configuration instanceof Error) {
      return;
    }

    refreshForm(configurationObjectJsonTemplate);
    dispatch('submit', configuration);
  }

</script>

<div class="form">
  <textarea class="{isError ? 'textarea textarea--invalid form__text' : 'textarea form__text'}"
            rows="7"
            bind:value={formText}
            on:keyup={onInputForm}></textarea>

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

  <div class="form__actions">
    <div class="form__actions-left">
      <button type="button"
              class="{submitButtonDisabled ? 'button button--disabled' : 'button button--default'}"
              disabled={submitButtonDisabled}
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
              class="{submitButtonDisabled ? 'button button--disabled' : 'button button--blue'}"
              disabled={submitButtonDisabled}
              on:click={onSubmitForm}>
        <span class="material-icons md-dark">
          done
        </span>
        Submit
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .form {
    width: 500px;

    &__text {
      width: 100%;
      margin-bottom: 15px;
      resize: none;
    }

    &__messages {
      margin-bottom: 15px;
    }

    &__actions {
      display: flex;
      justify-content: space-between;

      &-left {
        align-self: flex-start;
      }
    }
  }
</style>
