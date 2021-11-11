import { writable } from 'svelte/store';
import { ConfigurationObject } from '@mf/core';

interface ConfigurationSelected {
  selected: ConfigurationObject;
  editable: boolean;
}

export const configurationSelected = writable<ConfigurationSelected>({
  selected: null,
  editable: false
});

