<script lang="ts">
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

  export let configurations;

  const dispatch = createEventDispatcher();

  /**
   *
   */
  function onAddConfiguration() {
    dispatch('add');
  }

  /**
   *
   */
  function onEditConfiguration(configuration: ConfigurationObject) {
    dispatch('edit', configuration);
  }

  /**
   *
   */
  function onToggleActiveConfiguration(configuration: ConfigurationObject, active: boolean) {
    const currentActive = !!active;
    configuration.active = currentActive;

    dispatch('toggleActive', configuration);
  }

  /**
   *
   */
  function onRefreshPage() {
    dispatch('refresh');
  }

  /**
   *
   */
   function onClosePage() {
    dispatch('close');
  }

</script>

<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr>
        <th> Name / URI </th>
        <th> Status </th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each $configurations as { uri, name, active, hasError }, i}
        <tr>
          <td>
            <div class="configuration-col">
              <span class="configuration-col__name text-overflow-ellipsis"
                    title="{name}">
                {#if name}
                  {name}
                {:else}
                  ...
                {/if}
              </span>
              <span class="configuration-col__uri text-overflow-ellipsis"
                    title="{uri}">
                {#if uri}
                  {uri}
                {:else}
                  ...
                {/if}
              </span>
            </div>
          </td>
          <td>
            {#if hasError}
              <span class="label label--error"
                    on:click={() => onToggleActiveConfiguration($configurations[i], true)}>
                Offline
              </span>
            {:else}
              {#if active}
                <span class="label label--active"
                      on:click={() => onToggleActiveConfiguration($configurations[i], false)}>
                  Active
                </span>
              {:else}
                <span class="label label--inactive"
                      on:click={() => onToggleActiveConfiguration($configurations[i], true)}>
                  Inactive
                </span>
              {/if}
            {/if}
          </td>
          <td>
            <a class="configuration-edit"
              on:click={() => onEditConfiguration($configurations[i])}>
              Edit
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="table-actions">
  <button type="button"
          class="button button--blue"
          on:click={onAddConfiguration}>
    <span class="material-icons md-dark">
      add_circle
    </span>
    Add
  </button>
  <button type="button"
          class="button button--default"
          on:click={onRefreshPage}>
    <span class="material-icons md-dark">
      refresh
    </span>
    Refresh page
  </button>
  <button type="button"
          class="button button--default close-button"
          on:click={onClosePage}>
    <span class="material-icons md-dark">
      clear
    </span>
    Close window
  </button>
</div>

<style lang="scss">
  .configuration-col {
    display: flex;
    flex-direction: column;

    &__name {
      max-width: 500px;
      //font-size: .875rem;
      line-height: 1.25rem;
      font-weight: 500;
      color: rgba(17, 24, 39, 1);
    }

    &__uri {
      max-width: 500px;
      //font-size: .875rem;
      line-height: 1.25rem;
      color: rgba(107, 114, 128, 1);
    }
  }

 .label {
    //&--active, &--inactive {
      cursor: pointer;
    //}
  }

  .table {
    thead {
      position: sticky;
      top: 0;
    }
  }

  .table-wrapper {
    height: calc(100vh - 62px);
    overflow-y: scroll;
  }

  .configuration-edit {
    font-weight: 500;
    text-align: right;
    cursor: pointer;
  }

  .close-button {
    position: absolute;
    right: 10px;
  }

</style>
