import onChange from 'on-change';
import axios from 'axios';
import { string, object } from 'yup';
import parseDOM from './parser.js';

const schema = object().shape({
  inputValue: string().required().url(),
});

export default () => {
  const state = {
    input: {
      inputField: 'default',
      inputValue: '',
    },
    urls: [],
    channels: [],
  };

  const button = document.querySelector('button');
  button.disabled = true;
  const input = document.querySelector('input');

  const watchedState = onChange(state, () => {
    const subline = document.getElementById('subline');
    if (state.input.inputField === 'invalid') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.add('border');
      input.classList.add('border-danger');
      input.classList.remove('border-success');
      subline.textContent = 'Are you sure this is an RSS link?';
      subline.classList.add('text-danger');
      subline.classList.remove('text-muted');
      subline.classList.remove('text-success');
    }
    if (state.input.inputField === 'valid') {
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      input.classList.add('border-success');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      subline.textContent = 'Looks like a valid RSS link. Now press add.';
      subline.classList.add('text-success');
      subline.classList.remove('text-muted');
      subline.classList.remove('text-danger');
    }
    if (state.input.inputField === 'default') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      input.classList.remove('border-success');
      subline.textContent = 'Example: https://ru.hexlet.io/lessons.rss';
      subline.classList.add('text-muted');
      subline.classList.remove('text-success');
      subline.classList.remove('text-danger');
    }
  });

  input.addEventListener('input', (e) => {
    watchedState.input.inputValue = e.target.value;
    const validation = schema.isValidSync(watchedState.input);
    if (validation && watchedState.input.inputValue.match(/rss/)) {
      watchedState.input.inputField = 'valid';
    }
    if (!validation || !watchedState.input.inputValue.match(/rss/)) {
      watchedState.input.inputField = 'invalid';
    }
    if (watchedState.input.inputValue === '') {
      watchedState.input.inputField = 'default';
    }
  });

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = watchedState.input.inputValue;
    input.value = '';
    watchedState.input.inputField = 'default';
    if (watchedState.urls.includes(url)) {
      alert('This feed has already been added!');
      return;
    }
    watchedState.urls.push(url);
    axios
      .get(url)
      .then((response) => {
        const rss = parseDOM(response.data, 'text/html');
        // console.log(rss);
        watchedState.channels.push({
          title: rss.querySelector('channel > title').textContent,
          description: rss.querySelector('channel > description').textContent,
          items: [],
        });
      })
      .catch((e) => console.log(e));
  });

};
