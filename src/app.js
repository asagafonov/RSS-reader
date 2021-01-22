import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import en from './locales/index.js';
import parseRSS from './parser.js';
import {
  initView,
  buildModalWindow,
  renderFeeds,
} from './view.js';

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
      status: '',
      error: null,
      duplicationBlacklist: [],
      fields: {
        input: {
          valid: true,
          error: null,
        },
      },
    },
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

    const validationError = validate(url, watched.form.duplicationBlacklist);

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

    const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

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
        watched.form.duplicationBlacklist.push(url);
        watched.form.duplicationBlacklist = _.uniq(watched.form.duplicationBlacklist);
      })
      .catch((error) => {
        watched.error = error.message;
        watched.form.status = 'failed';
        console.log(error.message);
      });
  });

  const updateRSS = () => {
    const handler = (counter = 0) => {
      if (counter < Infinity) {
        watched.feeds.forEach((currFeed) => {
          const { url } = currFeed;
          const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          axios
            .get(urlViaProxy)
            .then((response) => {
              const rssFeed = parseRSS(response.data.contents);
              const currPosts = rssFeed.posts;
              const oldPosts = currFeed.posts;
              const oldPostsLinks = oldPosts.map((post) => post.postLink);
              currPosts.forEach((currPost) => {
                const { postTitle, postDescription, postLink } = currPost;
                if (!oldPostsLinks.includes(postLink)) {
                  watched.feeds.forEach((feed) => {
                    if (feed.url === url) {
                      feed.posts.unshift({
                        postTitle,
                        postDescription,
                        postLink,
                      });
                      watched.uiState.posts.push({
                        postLink,
                        status: 'unread',
                      });
                    }
                  });
                }
              });
              renderFeeds(watched, elements);
            })
            .catch((updateError) => console.log(updateError.message));
        });
        setTimeout(() => handler(counter + 1), 5000);
      }
    };
    handler();
  };

  updateRSS();
};
