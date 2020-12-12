export default (data, format, url) => {
  const domparser = new DOMParser();
  const rss = domparser.parseFromString(data, format);

  const feedTitle = rss.querySelector('channel > title').textContent;
  const feedDescription = rss.querySelector('channel > description').textContent;
  const feed = {
    id: Date.now(),
    feedTitle,
    feedDescription,
    url,
    posts: [],
  };

  const items = rss.querySelectorAll('item');

  items.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    feed.posts.unshift({
      feedId: feed.id,
      postId: Date.now(),
      postTitle,
      postLink,
    });
  });

  return feed;
};
