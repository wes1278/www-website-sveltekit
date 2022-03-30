<script >
	import RangeSlider from "svelte-range-slider-pips";
	import { v4 as uuidv4 } from "uuid";
	import { shows } from './store'

	let prefix = '';
	let rangeValues = [10,90]
	let title = '';
	let rating = 0;
	let note = '';

	let i = 0;
	let selectedId = ''

	function filterShows(prefix,rangeValues){
		return $shows && $shows.filter(show => {
			return show.rating >= rangeValues[0]
				&& show.rating<=rangeValues[1]
				&& (!prefix || (prefix && show.title.toLowerCase().indexOf(prefix.toLowerCase()) >= 0));
		})
	}

	$: filteredShows = $shows && filterShows(prefix,rangeValues);

	$: selected = selectedId && filteredShows.find(s => s.uid === selectedId);

	$: reset_inputs(selected);

	function create() {
		let uid = uuidv4()
		$shows = [...$shows, { title,rating,note,uid }];
		selectedId = uid;
		i = shows.length - 1;
		resetForm();
	}

	function update() {
		const index = $shows.findIndex(s=>s.uid === selectedId);
		const show = $shows[index]
		$shows = [...$shows.slice(0, index), {title,rating,note,uid:show.uid},...$shows.slice(index + 1)];
	}
	function resetForm(){
		title = rating = note = '';
	}
	function remove() {
		const index = $shows.findIndex(s=>s.uid === selectedId);
		$shows = [...$shows.slice(0, index), ...$shows.slice(index + 1)];

		resetForm()
		i = Math.max(i, filteredShows.length - 2);
		selectedId = filteredShows[i].uid;
	}

	function reset_inputs(_show) {
		title = _show ? _show.title : '';
		rating = _show ? _show.rating : '';
		note = _show ? _show.note : '';
	}
</script>

<svelte:head>
	<title>TV Shows</title>
</svelte:head>

<div class="todos">

<h1>TV Shows</h1>
<input placeholder="filter by name" bind:value={prefix}>
<RangeSlider float range min={0} max={100} bind:values={rangeValues}/>

<select bind:value={selectedId} size={5}>
	{#each filteredShows as show, i}
		<option value={show.uid}>{show.title} - Rating:{show.rating}</option>
	{/each}
</select>

<label><input bind:value={title} placeholder="title"></label>
<label><input bind:value={rating} type="number" min=0 max=100 placeholder="rating"></label>
<label><textarea bind:value={note} type="textarea" rows=5 cols=100 placeholder="note"></textarea></label>

<div class='buttons'>
	<button on:click={create} disabled="{!title}">create</button>
	<button on:click={update} disabled="{!title || !selectedId}">update</button>
	<button on:click={remove} disabled="{!selectedId}">delete</button>
</div>

<style>
	* {
		font-family: inherit;
		font-size: inherit;
	}

	input {
		display: block;
		margin: 0 0 0.5em 0;
	}

	select {
		float: left;
		margin: 0 1em 1em 0;
		width: 14em;
	}

	.buttons {
		clear: both;
	}
</style>
</div>
<!--<script context="module">
	import { enhance } from '$lib/form';
	import { browser } from '$app/env';

	export const load = async () => {
    let shows = browser ? window.localStorage.getItem('shows') ?? [] : [];
    return {
      props: { shows }
    };
	};
</script>

<script>
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

  export let shows;

	async function patch(res) {
		const show = await res.json();

		shows = shows.map((s) => {
			if (s.uid === show.uid) return show;
			return s;
		});
	}
</script>

<svelte:head>
	<title>TV Shows</title>
</svelte:head>

<div class="shows">
	<h1>TV Shows</h1>

	<form
		class="new"
		action="/shows.json"
		method="post"
		use:enhance={{
			result: async (res, form) => {
				const created = await res.json();
				shows = [...shows, created];

				form.reset();
			}
		}}
	>
		<input name="text" aria-label="Add TV Show Name" placeholder="+ tap to add a todo" />
    <input name="number" min="0" max="100" step="1" aria-label="Add TV Show rating" placeholder="rate this show" />
	</form>

	{#each shows as show (show.uid)}
		<div
			class="show"
			class:done={show.done}
			transition:scale|local={{ start: 0.7 }}
			animate:flip={{ duration: 200 }}
		>
			<form
				action="/shows/{show.uid}.json?_method=PATCH"
				method="post"
				use:enhance={{
					pending: (data) => {
						show.done = !!data.get('done');
					},
					result: patch
				}}
			>
				<input type="hidden" name="done" value={show.done ? '' : 'true'} />
				<button class="toggle" aria-label="Mark show as {show.done ? 'not done' : 'done'}" />
			</form>

			<form
				class="text"
				action="/shows/{show.uid}.json?_method=PATCH"
				method="post"
				use:enhance={{
					result: patch
				}}
			>
				<input aria-label="Edit TV Show Name" type="text" name="text" value={show.text} />
        <input aria-label="Rate this TV Show" type="number" name="num" value={show.rating} />
				<button class="save" aria-label="Save todo" />
			</form>

			<form
				action="/shows/{show.uid}.json?_method=DELETE"
				method="post"
				use:enhance={{
					pending: () => (show.pending_delete = true),
					result: () => {
						shows = shows.filter((t) => t.uid !== show.uid);
					}
				}}
			>
				<button class="delete" aria-label="Delete todo" disabled={show.pending_delete} />
			</form>
		</div>
	{/each}
</div>

<style>
	.shows {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}

	.new {
		margin: 0 0 0.5rem 0;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.new input {
		font-size: 28px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
	}

	.show {
		display: grid;
		grid-template-columns: 2rem 1fr 2rem;
		grid-gap: 0.5rem;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		transition: filter 0.2s, transform 0.2s;
	}

	.done {
		transform: none;
		opacity: 0.4;
		filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.1));
	}

	form.text {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.show input {
		flex: 1;
		padding: 0.5em 2em 0.5em 0.8em;
		border-radius: 3px;
	}

	.show button {
		width: 2em;
		height: 2em;
		border: none;
		background-color: transparent;
		background-position: 50% 50%;
		background-repeat: no-repeat;
	}

	button.toggle {
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		box-sizing: border-box;
		background-size: 1em auto;
	}

	.done .toggle {
		background-image: url("data:image/svg+xml,%3Csvg width='22' height='16' viewBox='0 0 22 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 1.5L7.4375 14.5L1.5 8.5909' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
	}

	.delete {
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
		opacity: 0.2;
	}

	.delete:hover,
	.delete:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}

	.save {
		position: absolute;
		right: 0;
		opacity: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A");
	}

	.show input:focus + .save,
	.save:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
-->