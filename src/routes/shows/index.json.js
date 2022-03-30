import { browser } from '$app/env';

// GET /shows.json
export const get = async (event) => {
  const shows = browser ? window.localStorage.getItem('shows') ?? [] : [];
  return shows;
};

// POST /shows.json
export const post = async (event) => {
	const data = await event.request.formData();
  const shows = browser ? window.localStorage.getItem('shows') ?? [] : [];
  shows.push(data);

  window.localStorage.set('shows',shows);
  return data;
};
