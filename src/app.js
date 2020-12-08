import axios from 'axios';
import { string, object } from 'yup';
import i18next from 'i18next';
import en from './locales/index.js';
import parseDOM from './parser.js';
import { initView, renderFeeds } from './view.js';

i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en,
  },
});


const validate = (state, url) => {
  const schema = object().shape({
    inputValue: string().required().url(),
  });

  const schemaValidation = schema.isValidSync(state.form);

  const hasDuplication = (state, url) => {
    const { feeds } = state.content;
    const listOfUrls = feeds.map((feed) => feed.id);
    return listOfUrls.includes(url);
  };

  if (schemaValidation) {
    state.form.validation = 'valid';
  }
  if (!schemaValidation) {
    state.form.validation = 'invalid';
  }
  if (hasDuplication(state, url)) {
    state.form.validation = 'invalid-duplication';
  }
};

export default () => {
  const state = {
    form: {
      validation: '',
      inputValue: '',
    },
    content: {
      feeds: [],
      posts: [],
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    subline: document.querySelector('#subline'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
  };

  const watched = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value;
    watched.form.inputValue = url;
    validate(watched, url);
    if (watched.form.validation !== 'valid') {
      return;
    }
    const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    axios
      .get(urlViaProxy)
      .then((response) => {
        const rss = parseDOM(response.data.contents, 'text/xml');
        watched.content.feeds.unshift({
          id: url,
          title: rss.querySelector('channel > title').textContent,
          description: rss.querySelector('channel > description').textContent,
        });
        const channelItems = rss.querySelectorAll('item');
        const itemsToAdd = [];
        channelItems.forEach((item) => {
          const title = item.querySelector('title').textContent;
          const id = item.querySelector('guid').textContent;
          const link = item.querySelector('link').textContent;
          itemsToAdd.push({
            channelId: url,
            id,
            title,
            link,
          });
        });
        for (let i = itemsToAdd.length - 1; i > 0; i -= 1) {
          watched.content.posts.unshift(itemsToAdd[i]);
        }
      })
      .catch((error) => {
        console.log(error);
        throw (error);
      });
  });

  const updateRSS = () => {
    const handler = (counter = 0) => {
      if (counter < Infinity) {
        watched.content.posts.forEach((source) => {
          const { channelId: url } = source;
          const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          axios
            .get(urlViaProxy)
            .then((response) => {
              const rss = parseDOM(response.data.contents, 'text/xml');
              const items = rss.querySelectorAll('item');
              const oldItemIds = state.content.posts.map((item) => item.id);
              items.forEach((item) => {
                const title = item.querySelector('title').textContent;
                const id = item.querySelector('guid').textContent;
                const link = item.querySelector('link').textContent;
                if (!oldItemIds.includes(id)) {
                  watched.content.posts.unshift({
                    channelId: url,
                    id,
                    title,
                    link,
                  });
                }
              });
            })
            .catch((err) => {
              console.log(err);
              throw (err);
            });
        });
        setTimeout(() => handler(counter + 1), 5000);
      }
    };
    handler();
    if (state.content.posts.length !== 0) {
      renderFeeds(state, elements);
    }
  };

  updateRSS();
};
