import { writable } from 'svelte/store'
import { browser, dev } from '$app/env';

const showsDefault = [
  { title: 'Star Wars', rating: 90 , note:'I love star wars.',uid:'3d67ace7-b5b3-4cad-91c8-c3e95ee3c216'},
  { title: 'Star Tre', rating: 50 , note:'Aaron loves star trek.',uid:'93072a92-ce17-4bb9-83bd-5371a1b7d4c5'},
  { title: 'Dark Knight', rating: 80 , note:'Batman is a vigilante.',uid:'16e12650-babc-4c5c-a7b6-71944372c57b'},
];



export const shows = writable(browser && (localStorage.getItem('shows') && JSON.parse(localStorage.getItem('shows')) || showsDefault));

shows.subscribe((val) => {
  return browser && localStorage.setItem('shows',JSON.stringify(val));
});