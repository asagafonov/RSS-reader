import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/index.js';
import parseRSS from './parser.js';
import { initView, buildModalWindow } from './view.js';
import updateRSS from './updater.js';

const validate = (value, blacklist = []) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(blacklist);

  try {
    schema.validateSync(value);
    return null;
  } catch (err) {
    return err.message;
  }
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  const state = {
    form: {
      status: 'waiting',
      error: null,
      fields: {
        input: {
          valid: true,
          error: null,
        },
      },
    },
    updateCount: 0,
    feeds: [],
    uiState: {
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
  buildModalWindow();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');

    const duplicationBlacklist = watched.feeds.map((feed) => feed.url);
    const validationError = validate(url, duplicationBlacklist);

    if (validationError) {
      watched.form.fields.input = {
        valid: false,
        error: validationError,
      };
      return;
    }

    watched.form.fields.input = {
      valid: true,
      error: null,
    };

    watched.error = null;
    watched.form.status = 'sending';

    const urlViaProxy = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`;

    axios
      .get(urlViaProxy)
      .then((response) => {
        const rssFeed = parseRSS(response.data.contents);
        rssFeed.url = url;
        watched.feeds.unshift(rssFeed);
        rssFeed.posts.forEach((el) => {
          const { postLink } = el;
          watched.uiState.posts.push({
            postLink,
            status: 'unread',
          });
        });
        watched.form.status = 'loaded';
      })
      .catch((error) => {
        watched.error = error.message;
        watched.form.status = 'failed';
        console.log(error);
      });
  });

  updateRSS(watched);
};
