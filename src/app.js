import onChange from 'on-change';
import axios from 'axios';
import { string, object } from 'yup';
import i18next from 'i18next';
import en from './locales/index.js';
import parseDOM from './parser.js';

i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en,
  },
});

const schema = object().shape({
  inputValue: string().required().url(),
});

const renderFeeds = (state) => {
  const feedsContainer = document.getElementById('feeds');
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18next.t('pageContent.feeds');
  feedsContainer.append(feedsTitle);
  const feedsList = document.createElement('ul');
  feedsList.setAttribute('class', 'list-group mb-5');
  feedsContainer.append(feedsList);
  const feeds = state.channels;
  feeds.forEach((feed) => {
    const { title, description } = feed;
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const p = document.createElement('p');
    p.textContent = description;
    const li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    li.append(h3);
    li.append(p);
    feedsList.append(li);
  });
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18next.t('pageContent.posts');
  postsContainer.append(postsTitle);
  const postsList = document.createElement('ul');
  postsList.setAttribute('class', 'list-group');
  postsContainer.append(postsList);
  const posts = state.items;
  posts.forEach((post) => {
    const { title, link } = post;
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.textContent = title;
    const li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    li.append(a);
    postsList.append(li);
  });
};

export default () => {
  const state = {
    input: {
      inputField: 'default',
      inputValue: '',
    },
    urls: [],
    channels: [],
    items: [],
  };

  const button = document.querySelector('button');
  button.disabled = true;
  const input = document.querySelector('input');

  const watchedState = onChange(state, (path) => {
    if (path.match(/^channels/) || path.match(/^items/)) {
      renderFeeds(state);
    }
    const subline = document.getElementById('subline');
    if (state.input.inputField === 'invalid') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.add('border');
      input.classList.add('border-danger');
      input.classList.remove('border-success');
      subline.textContent = i18next.t('validation.warning');
      subline.classList.add('text-danger');
      subline.classList.remove('text-success');
    }
    if (state.input.inputField === 'valid') {
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      input.classList.add('border-success');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      subline.textContent = i18next.t('validation.success');
      subline.classList.add('text-success');
      subline.classList.remove('text-danger');
    }
    if (state.input.inputField === 'default') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      input.classList.remove('border-success');
      subline.textContent = '';
      input.value = state.input.inputValue;
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
    watchedState.input.inputField = 'default';
    watchedState.input.inputValue = '';
    if (watchedState.urls.includes(url)) {
      alert(i18next.t('alert.duplication'));
      return;
    }
    watchedState.urls.push(url);
    const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    axios
      .get(urlViaProxy)
      .then((response) => {
        const rss = parseDOM(response.data.contents, 'text/xml');
        watchedState.channels.push({
          id: url,
          title: rss.querySelector('channel > title').textContent,
          description: rss.querySelector('channel > description').textContent,
        });
        const channelItems = rss.querySelectorAll('item');
        channelItems.forEach((item) => {
          const title = item.querySelector('title').textContent;
          const description = item.querySelector('description').textContent;
          const link = item.querySelector('link').textContent;
          watchedState.items.push({
            id: url,
            title,
            description,
            link,
          });
        });
      })
      .catch((error) => {
        console.log(error);
        watchedState.urls = watchedState.urls.filter((el) => el !== url);
        alert(i18next.t('alert.error'));
      });
  });
};
