import i18next from 'i18next';
import onChange from 'on-change';

const modalInnerElements = [
  '<div class="modal-dialog">',
  '  <div class="modal-content">',
  '    <div class="modal-header">',
  '      <h5 class="modal-title"></h5>',
  '      <button type="button" class="close" data-dismiss="modal" aria-label="Close">',
  '        <span aria-hidden="true">x</span>',
  '      </button>',
  '    </div>',
  '    <div class="modal-body"></div>',
  '    <div class="modal-footer">',
  '      <a class="btn btn-primary" role="button" id="modal-forward" href="">Full article</a>',
  '      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>',
  '    </div>',
  '  </div>',
  '</div>',
];

const buildModalWindow = () => {
  const body = document.querySelector('body');
  const modalWindow = document.createElement('div');
  modalWindow.setAttribute('id', 'modal');
  modalWindow.setAttribute('class', 'modal fade hide');
  body.prepend(modalWindow);
  const modalContent = modalInnerElements.join('\n');
  modalWindow.innerHTML = modalContent;
};

const changeModalWindowContent = (title, description, link) => {
  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = description;
  const goToArticleButton = document.querySelector('#modal-forward');
  goToArticleButton.setAttribute('href', link);
};

const setLinkWeight = (post, aEl, link) => {
  if (post.postLink === link) {
    if (post.status === 'read') {
      aEl.setAttribute('class', 'font-weight-regular');
    }
    if (post.status === 'unread') {
      aEl.setAttribute('class', 'font-weight-bold');
    }
  }
};

const changePostStatus = (posts, link) => {
  posts.forEach((post) => {
    if (post.postLink === link) {
      post.status = 'read'; // eslint-disable-line no-param-reassign
    }
  });
};

const renderFeeds = (state, elements) => {
  if (state.feeds.length === 0) {
    return;
  }
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18next.t('pageContent.feeds');
  feedsContainer.append(feedsTitle);
  const feedsList = document.createElement('ul');
  feedsList.setAttribute('class', 'list-group mb-5');
  feedsContainer.append(feedsList);
  const { feeds } = state;
  feeds.forEach((feed) => {
    const { feedTitle, feedDescription } = feed;
    const h3 = document.createElement('h3');
    h3.textContent = feedTitle;
    const p = document.createElement('p');
    p.textContent = feedDescription;
    const li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    li.append(h3);
    li.append(p);
    feedsList.append(li);
  });

  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18next.t('pageContent.posts');
  postsContainer.append(postsTitle);
  const postsList = document.createElement('ul');
  postsList.setAttribute('class', 'list-group');
  postsContainer.append(postsList);
  feeds.forEach((feed) => {
    const { posts } = feed;
    posts.forEach((post) => {
      const { postTitle, postLink } = post;
      const a = document.createElement('a');
      a.setAttribute('href', postLink);
      const postsToCheck = state.uiState.posts;
      postsToCheck.forEach((p) => setLinkWeight(p, a, postLink));
      a.textContent = postTitle;
      const li = document.createElement('li');
      li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      li.append(a);

      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('class', 'btn btn-primary btn-sm');
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#modal');
      button.setAttribute('id', postLink);
      button.textContent = i18next.t('pageContent.previewButton');
      li.append(button);

      postsList.append(li);

      const modalButtons = document.querySelectorAll('button[data-toggle="modal"]');

      modalButtons.forEach((btn) => {
        btn.addEventListener('click', (event) => {
          const link = event.target.id;
          state.feeds.forEach((currFeed) => {
            currFeed.posts.forEach((currPost) => {
              if (currPost.postLink === link) {
                const { postTitle: title, postDescription } = currPost;
                changeModalWindowContent(title, postDescription, link);
                changePostStatus(postsToCheck, link);
                renderFeeds(state, elements);
              }
            });
          });
        });
      });

      const hrefs = document.querySelectorAll('li > a');

      hrefs.forEach((text) => {
        text.addEventListener('click', (e) => {
          const link = e.target.href;
          changePostStatus(postsToCheck, link);
          renderFeeds(state, elements);
        });
      });
    });
  });
};

const renderFormStatus = (state, elements) => {
  const { button, input, subline } = elements;

  switch (state.form.status) {
    case 'sending':
      button.disabled = true;
      input.disabled = true;
      break;

    case 'loaded':
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      input.disabled = false;
      input.classList.add('border-success');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      subline.textContent = i18next.t('validation.success');
      subline.classList.add('text-success');
      subline.classList.remove('text-danger');
      renderFeeds(state, elements);
      break;

    case 'failed':
      button.disabled = false;
      input.disabled = false;
      input.select();
      break;

    default:
      throw Error(`Unknown form status: ${state.form.status}`);
  }
};

const renderValidationError = (state, elements) => {
  if (state.form.fields.input.valid) return;

  const { button, input, subline } = elements;

  if (state.form.fields.input.error.match(/this must be a valid URL/)) {
    button.setAttribute('aria-disabled', 'true');
    input.classList.add('border');
    input.classList.add('border-danger');
    input.classList.remove('border-success');
    input.select();
    subline.textContent = i18next.t('validation.warning');
    subline.classList.add('text-danger');
    subline.classList.remove('text-success');
  }
  if (state.form.fields.input.error.match(/this must not be one of the following values/)) {
    button.setAttribute('aria-disabled', 'true');
    input.classList.add('border');
    input.classList.add('border-danger');
    input.classList.remove('border-success');
    input.select();
    subline.textContent = i18next.t('validation.duplication');
    subline.classList.add('text-danger');
    subline.classList.remove('text-success');
  }
};

const renderAppError = (state, elements) => {
  if (!state.error) return;

  const { button, input, subline } = elements;

  button.setAttribute('aria-disabled', 'true');
  input.classList.add('border');
  input.classList.add('border-danger');
  input.classList.remove('border-success');
  subline.textContent = i18next.t('error.failed');
  subline.classList.add('text-danger');
  subline.classList.remove('text-success');
};

const initView = (state, elements) => {
  elements.input.focus();

  const mapping = {
    'form.status': () => renderFormStatus(state, elements),
    'form.fields.input': () => renderValidationError(state, elements),
    updateCount: () => renderFeeds(state, elements),
    error: () => renderAppError(state, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export {
  initView,
  buildModalWindow,
};
