import axios from 'axios';
import { string, object } from 'yup';
import i18next from 'i18next';
import en from './locales/index.js';
import parseRSS from './parser.js';
import {
  initView,
  renderFeeds,
  buildModalWindow,
  changeModalWindowContent
} from './view.js';

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

const hasDuplication = (appState, link) => {
  const { feeds } = appState;
  const listOfUrls = feeds.map((feed) => feed.url);
  return listOfUrls.includes(link);
};

export default () => {
  const state = {
    form: {
      status: 'waiting',
      validation: '',
      inputValue: '',
    },
    feeds: [],
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
    const url = elements.input.value;
    watched.form.inputValue = url;
    watched.form.status = 'sending';

    const schemaValidation = schema.isValidSync(watched.form);

    if (schemaValidation) {
      watched.form.validation = 'valid';
    }
    if (!schemaValidation) {
      watched.form.validation = 'invalid';
    }
    if (hasDuplication(watched, url)) {
      watched.form.validation = 'invalid-duplication';
    }
    if (watched.form.validation !== 'valid') {
      return;
    }

    elements.button.disabled = true;

    const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    axios
      .get(urlViaProxy)
      .then((response) => {
        const rssFeed = parseRSS(response.data.contents, 'text/xml', url);
        watched.feeds.unshift(rssFeed);
        watched.form.status = 'loaded';
        elements.button.disabled = false;

        const modalButtons = document.querySelectorAll('button[data-toggle="modal"]');

        modalButtons.forEach((button) => {
          button.addEventListener('click', (e) => {
            const link = e.target.id;
            watched.feeds.forEach((feed) => {
              feed.posts.forEach((post) => {
                if (post.postLink === link) {
                  const { postTitle, postDescription } = post;
                  changeModalWindowContent(postTitle, postDescription, link);
                  post.status = 'read';
                }
              });
            })
          });
        });
      })
      .then(() => {
        watched.form.status = 'waiting';
      })
      .catch((error) => {
        console.log(error);
        throw (error);
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
              const rssFeed = parseRSS(response.data.contents, 'text/xml', url);
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
                        status: 'unread',
                      });
                      watched.form.status = 'loaded';
                    };
                  });
                };
              });
            })
            .then(() => {
              watched.form.status = 'waiting';
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
    if (watched.feeds.length !== 0) {
      renderFeeds(watched, elements);
    }
  };

  updateRSS();
};

// http://lorem-rss.herokuapp.com/feed?length=2&unit=second&interval=10
