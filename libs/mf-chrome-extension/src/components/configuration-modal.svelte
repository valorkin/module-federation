<script lang="ts">
  import ConfigurationForm from './configuration-form.svelte';

  function onSubmit(e: CustomEvent) {
    console.log(e.detail);
  }
</script>

<h4>
  Add Configuration Object
</h4>

<ConfigurationForm configuration={null}
                   on:submit={onSubmit} />

<style lang="scss">
  h4 {
    margin-bottom: 10px;
  }
</style>
