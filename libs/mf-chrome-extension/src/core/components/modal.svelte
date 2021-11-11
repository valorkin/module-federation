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

	onDestroy(() => {
		delete modals[id];
		window.removeEventListener('keydown', onKeyPress);
	});

</script>


{#if visible}
  <div id="topModal"
       bind:this={topDiv}
       on:click={() => close()}>
    <div id='modal'
         on:click|stopPropagation={() => {}}>
      <span id="close"
            class="material-icons md-dark"
            on:click={() => close()}>
        close
      </span>
      <div id='modal-content'>
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
	#topModal {
		z-index: 9999;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #4448;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#modal {
		position: relative;
		border-radius: 6px;
		background: white;
    border: 0;
		filter: drop-shadow(2px 2px 1px #555);
		padding: 2em;
	}

	#close {
		position: absolute;
		top: 5px;
		right: 5px;
    font-size: 18px;
		cursor: pointer;
    color: rgba(229, 231, 235, 1);
	}

	#close:hover {
		color: #555;
	}

	#modal-content {
		max-width: calc(100vw - 20px);
		max-height: calc(100vh - 20px);
		overflow: auto;
	}
</style>
