import onChange from 'on-change';
import { string, object } from 'yup';

const schema = object().shape({
  inputValue: string().required().url(),
});

export default () => {
  const state = {
    inputField: 'default',
    inputValue: '',
  };

  const button = document.querySelector('button');
  button.disabled = true;
  const input = document.querySelector('input');

  const watchedState = onChange(state, () => {
    const subline = document.getElementById('subline');
    if (state.inputField === 'invalid') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.add('border');
      input.classList.add('border-danger');
      input.classList.remove('border-success');
      subline.textContent = 'Are you sure this is an RSS link?';
      subline.classList.add('text-danger');
      subline.classList.remove('text-muted');
      subline.classList.remove('text-success');
    }
    if (state.inputField === 'valid') {
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      input.classList.add('border-success');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      subline.textContent = 'Looks like a valid RSS link! Now press add.';
      subline.classList.add('text-success');
      subline.classList.remove('text-muted');
      subline.classList.remove('text-danger');
    }
    if (state.inputField === 'default') {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      input.classList.remove('border');
      input.classList.remove('border-danger');
      input.classList.remove('border-success');
      subline.textContent = 'Example: https://ru.hexlet.io/lessons.rss';
      subline.classList.add('text-muted');
      subline.classList.remove('text-success');
      subline.classList.remove('text-danger');
    }
  });

  input.addEventListener('input', (e) => {
    watchedState.inputValue = e.target.value;
    const validation = schema.isValidSync(watchedState);
    if (validation && watchedState.inputValue.match(/rss/)) {
      watchedState.inputField = 'valid';
    }
    if (!validation || !watchedState.inputValue.match(/rss/)) {
      watchedState.inputField = 'invalid';
    }
    if (watchedState.inputValue === '') {
      watchedState.inputField = 'default';
    }
  });
};
