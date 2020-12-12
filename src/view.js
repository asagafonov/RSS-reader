import i18next from 'i18next';
import onChange from 'on-change';

const renderFeeds = (state, elements) => {
  if (state.content.feeds.length !== 0) {
    const { feedsContainer } = elements;
    feedsContainer.innerHTML = '';
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18next.t('pageContent.feeds');
    feedsContainer.append(feedsTitle);
    const feedsList = document.createElement('ul');
    feedsList.setAttribute('class', 'list-group mb-5');
    feedsContainer.append(feedsList);
    const { feeds } = state.content;
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
  if (state.content.posts.length !== 0) {
    const { postsContainer } = elements;
    postsContainer.innerHTML = '';
    const postsTitle = document.createElement('h2');
    postsTitle.textContent = i18next.t('pageContent.posts');
    postsContainer.append(postsTitle);
    const postsList = document.createElement('ul');
    postsList.setAttribute('class', 'list-group');
    postsContainer.append(postsList);
    const { posts } = state.content;
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

const initView = (state, elements) => {
  const watchedState = onChange(state, (path) => {
    const { button, input, subline } = elements;
    if ((path.match(/feeds/) || path.match(/posts/))) {
      renderFeeds(state, elements);
    }
    if (state.form.validation === 'invalid') {
      button.setAttribute('aria-disabled', 'true');
      input.classList.add('border');
      input.classList.add('border-danger');
      input.classList.remove('border-success');
      subline.textContent = i18next.t('validation.warning');
      subline.classList.add('text-danger');
      subline.classList.remove('text-success');
    }
    if (state.form.validation === 'valid') {
      button.removeAttribute('aria-disabled');
      input.classList.add('border-success');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      subline.textContent = i18next.t('validation.success');
      subline.classList.add('text-success');
      subline.classList.remove('text-danger');
    }
    if (state.form.validation === 'invalid-duplication') {
      button.setAttribute('aria-disabled', 'true');
      input.classList.add('border');
      input.classList.add('border-danger');
      input.classList.remove('border-success');
      subline.textContent = i18next.t('validation.duplication');
      subline.classList.add('text-danger');
      subline.classList.remove('text-success');
    }
  });
  return watchedState;
};

export { renderFeeds, initView };