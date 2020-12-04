import onChange from 'on-change';

const renderFeeds = (state, elements) => {
  if (state.channels.length !== 0) {
    const feedsContainer = elements.feedsContainer;
    feedsContainer.innerHTML = '';
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18next.t('pageContent.feeds');
    feedsContainer.append(feedsTitle);
    const feedsList = document.createElement('ul');
    feedsList.setAttribute('class', 'list-group mb-5');
    feedsContainer.append(feedsList);
    const feeds = state.channels;
    feeds.forEach((feed) => {
      const { title, description } = feed;
      const h3 = document.createElement('h3');
      h3.textContent = title;
      const p = document.createElement('p');
      p.textContent = description;
      const li = document.createElement('li');
      li.setAttribute('class', 'list-group-item');
      li.append(h3);
      li.append(p);
      feedsList.append(li);
    });
  }
  if (state.items.length !== 0) {
    const postsContainer = elements.postsContainer;
    elements.postsContainer.innerHTML = '';
    const postsTitle = document.createElement('h2');
    postsTitle.textContent = i18next.t('pageContent.posts');
    postsContainer.append(postsTitle);
    const postsList = document.createElement('ul');
    postsList.setAttribute('class', 'list-group');
    postsContainer.append(postsList);
    const posts = state.items;
    posts.forEach((post) => {
      const { title, link } = post;
      const a = document.createElement('a');
      a.setAttribute('href', link);
      a.textContent = title;
      const li = document.createElement('li');
      li.setAttribute('class', 'list-group-item');
      li.append(a);
      postsList.append(li);
    });
  }
};

export default (state, elements) => {
  const watchedState = onChange(state, (path) => {
    if ((path.match(/^channels/) || path.match(/^items/))) {
      renderFeeds(state, elements);
    }
    if (state.input.inputField === 'invalid') {
      elements.button.disabled = true;
      elements.button.setAttribute('aria-disabled', 'true');
      elements.input.classList.add('border');
      elements.input.classList.add('border-danger');
      elements.input.classList.remove('border-success');
      elements.subline.textContent = i18next.t('validation.warning');
      elements.subline.classList.add('text-danger');
      elements.subline.classList.remove('text-success');
    }
    if (state.input.inputField === 'valid') {
      elements.button.disabled = false;
      elements.button.removeAttribute('aria-disabled');
      elements.input.classList.add('border-success');
      elements.input.classList.remove('border');
      elements.input.classList.remove('border-danger');
      elements.subline.textContent = i18next.t('validation.success');
      elements.subline.classList.add('text-success');
      elements.subline.classList.remove('text-danger');
    }
    if (state.input.inputField === 'default') {
      elements.button.disabled = true;
      elements.button.setAttribute('aria-disabled', 'true');
      elements.input.classList.remove('border');
      elements.input.classList.remove('border-danger');
      elements.input.classList.remove('border-success');
      elements.subline.textContent = '';
      elements.input.value = state.input.inputValue;
    }
  });
  return watchedState;
};
