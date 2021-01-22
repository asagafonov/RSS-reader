import axios from 'axios';
import { renderFeeds } from './view.js';
import parseRSS from './parser.js';

const updatePosts = (state, post, links, url) => {
  const { postTitle, postDescription, postLink } = post;
  if (!links.includes(postLink)) {
    state.feeds.forEach((feed) => {
      if (feed.url === url) {
        feed.posts.unshift({
          postTitle,
          postDescription,
          postLink,
        });
        state.uiState.posts.push({
          postLink,
          status: 'unread',
        });
      }
    });
  }
};

const updateFeed = (state, feed, elements) => {
  const { url } = feed;
  const urlViaProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  axios
    .get(urlViaProxy)
    .then((response) => {
      const rssFeed = parseRSS(response.data.contents);
      const currPosts = rssFeed.posts;
      const oldPosts = feed.posts;
      const oldPostsLinks = oldPosts.map((post) => post.postLink);
      currPosts.forEach((currPost) => updatePosts(state, currPost, oldPostsLinks, url));
      renderFeeds(state, elements);
    })
    .catch((updateError) => console.log(updateError));
};

const updateRSS = (state, elements) => {
  const handler = (counter = 0) => {
    if (counter < Infinity) {
      state.feeds.forEach((currFeed) => updateFeed(state, currFeed, elements));
      setTimeout(() => handler(counter + 1), 5000);
    }
  };
  handler();
};

export default updateRSS;
