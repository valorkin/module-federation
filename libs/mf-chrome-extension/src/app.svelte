<script lang="ts">
  import { onMount } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

  import Modal, { getModal } from './core/components/modal.svelte'
  import { MFChromeExtensionActions } from './core/constant'
  import { configurations } from './stores/configurations-store';
  import { configurationSelected } from './stores/configuration-selected';
  import ConfigurationsTable from './components/configurations-table.svelte';
  import ConfigurationModal from './components/configuration-modal.svelte';

  onMount(() => {
    sendMessage(MFChromeExtensionActions.PopupOpened, null);
  });

  /**
   *
   */
  function onAddConfigurationDialog() {
    configurationSelected.set({
      selected: null,
      editable: false
    });

    openConfigurationDialog();
  }

  /**
   *
   */
  function onEditConfigurationDialog(e: CustomEvent) {
    const configuration = e.detail as ConfigurationObject;

    configurationSelected.set({
      selected: configuration,
      editable: true
    });

    openConfigurationDialog();
  }

  /**
   *
   */
  function onSubmitConfiguration(e: CustomEvent) {
    const configuration = e.detail as ConfigurationObject;

    const { selected, editable } = $configurationSelected;

    closeConfigurationDialog();

    if (editable) {
      const editedConfiguration = {
        ...selected,
        ...configuration
      };

      sendMessage(MFChromeExtensionActions.UpdateConfigurationObject, editedConfiguration);
      return;
    }

    sendMessage(MFChromeExtensionActions.AddConfigurationObject, configuration);
  }

  /**
   *
   */
   function onToggleActiveConfiguration(e: CustomEvent) {
    const configuration = e.detail as ConfigurationObject;
    sendMessage(MFChromeExtensionActions.UpdateConfigurationObject, configuration);
  }

  /**
   *
   */
   function onRefreshPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  }


  /**
   *
   */
  function openConfigurationDialog() {
    const modal = getModal('configurationModal');
    modal.open();
  }

  /**
   *
   */
  function closeConfigurationDialog() {
    const modal = getModal('configurationModal');
    modal.close();
  }

  /**
   * Sends the json object to the content script
   */
  function sendMessage(action: MFChromeExtensionActions, payload: any) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action,
          payload
        }
      );
    });
  }

</script>

<main>
  <Modal id="configurationModal">
    <ConfigurationModal on:submit={onSubmitConfiguration}/>
  </Modal>

  <ConfigurationsTable {configurations}
                       on:add={onAddConfigurationDialog}
                       on:edit={onEditConfigurationDialog}
                       on:toggleActive={onToggleActiveConfiguration}
                       on:refresh={onRefreshPage}
  />
</main>

<style lang="scss">
  main {
    min-height: 100%;
    padding: 10px;
    overflow: hidden;
  }
</style>
