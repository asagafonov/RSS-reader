export default (data) => {
  const domparser = new DOMParser();
  const rss = domparser.parseFromString(data, 'text/xml');

  const feedTitle = rss.querySelector('channel > title').textContent;
  const feedDescription = rss.querySelector('channel > description').textContent;

  const feed = {
    feedTitle,
    feedDescription,
    posts: [],
  };

  const items = rss.querySelectorAll('item');

  items.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    feed.posts.push({
      postTitle,
      postDescription,
      postLink,
    });
  });

  return feed;
};
