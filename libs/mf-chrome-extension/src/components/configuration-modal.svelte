<script lang="ts">
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { ConfigurationObject } from '@mf/core';
  import { configurationSelected } from '../stores/configuration-selected';

  import ConfigurationForm from './configuration-form.svelte';

  const dispatch = createEventDispatcher();

  //
  let clippedConfiguration;

  /**
   *
   */
  const unsubscribe = configurationSelected.subscribe((store) => {
    if (!store.selected) {
      return;
    }

    // we don't want `status`, `uuid` to be edited
    const { uri, name, definitionUri, version, priority } = store.selected;

    clippedConfiguration = {
      uri,
      name,
      definitionUri,
      priority,
      version
    };
  });

  /**
   *
   */
  function onSubmitConfiguration(e: CustomEvent) {
    console.log(e.detail);
    dispatch('submit', e.detail as ConfigurationObject);
  }

  //
  onDestroy(unsubscribe);

</script>

<h4>
  { $configurationSelected.editable ? 'Edit' : 'Add' } Configuration Object
</h4>

<ConfigurationForm configuration={clippedConfiguration}
                   on:submit={onSubmitConfiguration} />

<style lang="scss">
  h4 {
    margin-bottom: 10px;
  }
</style>
