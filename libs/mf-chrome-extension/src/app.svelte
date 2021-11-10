<script lang="ts">
  import { onMount } from 'svelte';
  import { ConfigurationObject } from '@mf/core';

  import Modal, { getModal } from './core/components/modal.svelte'
  import { MFChromeExtensionActions } from './core/constant'
  import { configurations } from './stores/configurations-store';
  import ConfigurationsTable from './components/configurations-table.svelte';
  import ConfigurationModal from './components/configuration-modal.svelte';

  onMount(() => {
    sendMessage(MFChromeExtensionActions.PopupOpened, null);
  });

  /**
   *
   */
  function onAddConfiguration() {
    const modal = getModal();
    modal.open();
  }

  /**
   *
   */
  function onEditConfiguration(e: CustomEvent) {
    const configuration = e.detail as ConfigurationObject;
    const modal = getModal();

    modal.open();
    console.log(configuration);
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
  <Modal>
    <ConfigurationModal />
  </Modal>

  <ConfigurationsTable {configurations}
                       on:add={onAddConfiguration}
                       on:edit={onEditConfiguration}
  />
</main>

<style lang="scss">
  main {
    padding: 10px;
  }
</style>
