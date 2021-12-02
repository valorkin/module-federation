<script context="module" lang="ts">
  // all modals get registered here for easy future access
  const modals = {};

  // keeping track of which open modal is on top
  let onTop: HTMLElement;

  /**
   *  Returns an object for the modal specified by `id`, which contains the API functions (`open` and `close` )
   */
  export function getModal(id = '') {
    return modals[id];
  }

</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  let topDiv: HTMLElement;
  let prevOnTop: HTMLElement;
  let visible = false;
  let closeFn: Function;

  export let id = '';

  /**
   *
   */
  function open(fn: Function) {
    closeFn = fn;

    if (visible) {
      return;
    }

    prevOnTop = onTop;
    onTop = topDiv;
    visible = true;

    window.addEventListener('keydown', onKeyPress);
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      document.body.appendChild(topDiv)
    });
  }

  /**
   *
   */
  function close(fn?: Function) {
    if (!visible) {
      return;
    }

    onTop = prevOnTop;
    visible = false;

    window.removeEventListener('keydown', onKeyPress);

    if (onTop === null) {
      document.body.style.overflow = '';
    }

    if (closeFn) {
      closeFn(fn);
    }
  }

  /**
   *
   */
    function onKeyPress(e: KeyboardEvent) {
    // only respond if the current modal is the top one
    if (e.key === 'Escape' && onTop === topDiv) {
      close();
    }
  }

  // expose the API
  modals[id] = { open, close };

  //
  onDestroy(() => {
    delete modals[id];
    window.removeEventListener('keydown', onKeyPress);
  });

</script>


{#if visible}
  <div class="modal"
       bind:this={topDiv}
       on:click={() => close()}>
    <div class='modal__body'
         on:click|stopPropagation={() => {}}>
      <span class="modal__close material-icons md-dark"
            on:click={() => close()}>
        close
      </span>
      <div id='modal__content'>
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

