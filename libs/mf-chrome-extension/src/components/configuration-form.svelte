<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
  import { form } from 'svelte-forms';
  import { ConfigurationObject, ConfigurationObjectPriorities } from '@mf/core';

  import { testForm } from '../core/validators/test-validator';

  export let configuration: ConfigurationObject;

  const dispatch = createEventDispatcher();

  let messageText: string = null;

  let isError = false;

  let {uri, name, version, definitionUri, priority} = configuration || {};

  let configurationForm;

  onMount(() => {
    configurationForm = form(() => ({
      uri: {
        value: uri,
        validators: ['required']
      },
      name: {
        value: name,
        validators: ['required']
      },
      definitionUri: {
        value: definitionUri,
        validators: []
      },
      priority: {
        value: typeof priority === 'number'
          ? priority
          : ConfigurationObjectPriorities.Initialized,
        validators: []
      }
    }),
      {
        validateOnChange: false
      }
    );
  });

  afterUpdate(() => {
    configurationForm.validate();
  });

  /**
   *
   */
  function getFormValue() {
    return {
      uri,
      name,
      version,
      definitionUri,
      priority
    }
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
    uri = '';
    name = '';
    version = '';
    definitionUri = '';
    priority = ConfigurationObjectPriorities.Inactive;

    hideMessage();
  }

  /**
   *
   */
  function onTestForm() {
    const configuration = getFormValue();

    hideMessage();

    testForm(configuration)
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
    const configuration = getFormValue();

    hideMessage();
    dispatch('submit', configuration);
  }

</script>

<div class="form">
  <div class="form-group">
    <label class="form-label"
           for="uri">
      * URI
    </label>
    <input type="text"
           id="uri"
           class="input {$configurationForm?.fields.uri.errors.includes('required') ? 'input--invalid' : ''}"
           bind:value={uri}>

    {#if $configurationForm?.fields.uri.errors.includes('required') }
      <div class="form-message form-message--error">
        <i class="material-icons md-dark">
          error_outline
        </i>
        URI is required
      </div>
    {/if}
  </div>

  <div class="form-group configuration">
    <div class="form-control configuration__name">
      <label class="form-label"
             for="name">
        * Name
      </label>
      <input type="text"
             id="name"
             class="input {$configurationForm?.fields.name.errors.includes('required') ? 'input--invalid' : ''}"
             bind:value={name}>

        {#if $configurationForm?.fields.name.errors.includes('required')}
          <div class="form-message form-message--error">
            <i class="material-icons md-dark">
              error_outline
            </i>
            Name is required
          </div>
        {/if}
    </div>
    <div class="form-control configuration__version">
      <label class="form-label"
             for="version">
        Version
      </label>
      <input type="text"
             id="version"
             class="input"
             bind:value={version}>
    </div>
  </div>

  <div class="form-group">
    <label class="form-label"
           for="definitionUri">
      Definition URI
    </label>
    <input type="text"
           id="definitionUri"
           class="input"
           bind:value={definitionUri}>
  </div>

  <div class="form-group">
    <label class="form-label"
           for="priority">
      Status
    </label>
    <select id="priority"
            class="select"
            bind:value={priority}>
      <option value={ConfigurationObjectPriorities.Initialized}
              disabled>
        Initialized
      </option>
      <option value={ConfigurationObjectPriorities.Error}
              disabled>
        Offline
      </option>
      <option value={ConfigurationObjectPriorities.Inactive}>
        Inactive
      </option>
      <option value={ConfigurationObjectPriorities.Active}>
        Active
      </option>
    </select>
  </div>

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
              class="{!$configurationForm?.valid ? 'button button--disabled' : 'button button--default'}"
              disabled={!$configurationForm?.valid}
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
              class="{!$configurationForm?.valid ? 'button button--disabled' : 'button button--blue'}"
              disabled={!$configurationForm?.valid}
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

    &__messages {
      margin-bottom: 15px;
    }

    &-message {
      margin-top: 5px;
    }

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

  .configuration {
    display: flex;
    width: 100%;

    &__name {
      width: 400px;
      margin-right: 10px;
    }

    &__version {
      width: 90px;
    }
  }

</style>
