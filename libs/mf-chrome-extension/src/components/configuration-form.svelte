<script lang="ts">
 	import { createEventDispatcher } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

  import { parseForm } from '../core/validators/form-validator';
  import { configurationObjectJsonTemplate } from '../core/constant'

  export let configuration: ConfigurationObject;

  let formText = '';

  let submitButtonDisabled = true;

  let testButtonDisabled = true;

  refreshForm(configurationObjectJsonTemplate);

  function refreshForm(value: ConfigurationObject) {
    formText = JSON.stringify(value, undefined, 2);
    // hideMessage();
    disableSubmitButton();
  }

  function onInputForm() {
    const json = parseForm(formText);

    if (json instanceof Error) {
      return;
    }

    // hideMessage();
    enableSubmitButton();
  };

  function disableSubmitButton() {
    submitButtonDisabled = true;
    testButtonDisabled = true;
  }

  function enableSubmitButton() {
    submitButtonDisabled = false;
    testButtonDisabled = false;
  }

  function onClearForm() {
    refreshForm(configurationObjectJsonTemplate);
  }

  function onSubmitForm() {
    const json = parseForm(formText);

    if (json instanceof Error) {
      return;
    }

    refreshForm(configurationObjectJsonTemplate);

    console.log(json);
  }

</script>

<div class="form">
  <textarea class="textarea form__text"
            rows="6"
            bind:value={formText}
            on:keyup={onInputForm}></textarea>

  <div class="form__actions">
    <div class="form__actions-left">
      <button type="button"
              class="button"
              on:click={null}>
        <span class="material-icons md-dark">
          bug_report
        </span>
        Test
      </button>
    </div>
    <div class="form__actions-right">
      <button type="button"
              class="button"
              on:click={onClearForm}>
        <span class="material-icons md-dark">
          clear
        </span>
        Clear
      </button>
      <button type="button"
              class="button button--blue"
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

    &__actions {
      display: flex;
      justify-content: space-between;

      &-left {
        align-self: flex-start;
      }
    }
  }
</style>
