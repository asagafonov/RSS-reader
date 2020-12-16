export default (data, format, url) => {
  const domparser = new DOMParser();
  const rss = domparser.parseFromString(data, format);

  const feedTitle = rss.querySelector('channel > title').textContent;
  const feedDescription = rss.querySelector('channel > description').textContent;
  const feed = {
    feedTitle,
    feedDescription,
    url,
    posts: [],
  };

  const items = rss.querySelectorAll('item');

  items.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    feed.posts.unshift({
      postTitle,
      postDescription,
      postLink,
      status: 'unread',
    });
  });

  return feed;
};
