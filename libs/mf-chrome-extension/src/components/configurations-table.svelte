<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

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

	export let configurations;
</script>

<div class="table-header">
  <button type="button"
          class="button button--blue"
          on:click={onAddConfiguration}>
    <span class="material-icons md-dark">
      add_circle
    </span>
    Add
  </button>
</div>

<table class="table">
  <thead>
    <tr>
      <th> Name / URI </th>
      <th> Definition URI </th>
      <th> Status </th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each $configurations as { uri, name, definitionUri, active }, i}
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
          <span class="configuration-definition-uri text-overflow-ellipsis"
                title="{definitionUri}">
            {#if definitionUri}
              {definitionUri}
            {:else}
              ...
            {/if}
          </span>
        </td>
        <td>
          {#if active}
            <span class="configuration-status configuration-status--active">
              Active
            </span>
          {:else}
            <span class="configuration-status configuration-status--inactive">
              Inactive
            </span>
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

<style lang="scss">
  .configuration-col {
    display: flex;
    flex-direction: column;

    &__name {
      max-width: 250px;
      //font-size: .875rem;
      line-height: 1.25rem;
      font-weight: 500;
      color: rgba(17, 24, 39, 1);
    }

    &__uri {
      max-width: 250px;
      //font-size: .875rem;
      line-height: 1.25rem;
      color: rgba(107, 114, 128, 1);
    }
  }

  .configuration-definition-uri {
    max-width: 250px;
    color: rgba(107, 114, 128, 1);
  }

  .configuration-status {
    display: inline-block;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    line-height: 1.25rem;
    font-weight: 600;
    border-radius: 9999px;

    &--active {
      color: rgba(6, 95, 70, 1);
      background-color: rgba(209, 250, 229, 1);
    }

    &--inactive {
      color: rgba(70, 70, 70, 1);
      background-color: rgba(243, 244, 246, 1)
    }
  }

  .configuration-edit {
    font-weight: 500;
    text-align: right;
    // pointer-events: none;
    cursor: pointer;
  }

  .text-overflow-ellipsis {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
