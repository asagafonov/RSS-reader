import axios from 'axios';
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

const updateFeed = (state, feed) => {
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
    })
    .catch((updateError) => console.log(updateError));
};

const updateRSS = (state) => {
  const initiateUpdate = () => {
    state.feeds.forEach((currFeed) => updateFeed(state, currFeed));
    state.updateCount += 1; // eslint-disable-line no-param-reassign
    setTimeout(() => initiateUpdate(), 5000);
  };
  initiateUpdate();
};

export default updateRSS;
