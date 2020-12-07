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
    items: [],
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    subline: document.querySelector('#subline'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
  };

  elements.button.disabled = true;

  const watched = initView(state, elements);

  elements.input.addEventListener('input', (e) => {
    watched.input.inputValue = e.target.value;
    const validation = schema.isValidSync(watched.input);
    if (validation) {
      watched.input.inputField = 'valid';
    }
    if (!validation) {
      watched.input.inputField = 'invalid';
    }
    if (watched.input.inputValue === '') {
      watched.input.inputField = 'default';
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = watched.input.inputValue;
    watched.input.inputField = 'default';
    watched.input.inputValue = '';
    if (watched.urls.includes(url)) {
      alert(i18next.t('alert.duplication'));
      return;
    }
    watched.urls.unshift(url);
    const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    axios
      .get(urlViaProxy)
      .then((response) => {
        const rss = parseDOM(response.data.contents, 'text/xml');
        watched.channels.unshift({
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
          watched.items.unshift(itemsToAdd[i]);
        }
      })
      .catch((error) => {
        console.log(error);
        watched.urls = watched.urls.filter((el) => el !== url);
        watched.channels = watched.channels.filter((el) => el.id !== url);
        watched.items = watched.items.filter((el) => el.channelId !== url);
        alert(i18next.t('alert.error'));
        throw (error);
      });
  });

  const updateRSS = () => {
    const handler = (counter = 0) => {
      if (counter < Infinity) {
        state.items.forEach((source) => {
          const { channelId: url } = source;
          const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          axios
            .get(urlViaProxy)
            .then((response) => {
              const rss = parseDOM(response.data.contents, 'text/xml');
              const items = rss.querySelectorAll('item');
              const oldItemIds = state.items.map((item) => item.id);
              items.forEach((item) => {
                const title = item.querySelector('title').textContent;
                const id = item.querySelector('guid').textContent;
                const link = item.querySelector('link').textContent;
                if (!oldItemIds.includes(id)) {
                  watched.items.unshift({
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
    if (state.items.length !== 0) {
      renderFeeds();
    }
  };

  updateRSS();
};
