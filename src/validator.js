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
    if (state.inputField === 'invalid') {
      input.classList.add('border');
      input.classList.add('border-danger');
      button.setAttribute('aria-disabled', 'true');
      button.disabled = true;
    }
    if (state.inputField === 'valid') {
      input.classList.remove('border');
      input.classList.remove('border-danger');
      button.removeAttribute('aria-disabled');
      button.disabled = false;
    }
    if (state.inputField === 'default') {
      input.classList.remove('border');
      input.classList.remove('border-danger');
      button.setAttribute('aria-disabled', 'true');
      button.disabled = true;
    }
  });

  input.addEventListener('input', (e) => {
    watchedState.inputValue = e.target.value;
    const validation = schema.isValidSync(watchedState);
    if (validation) {
      watchedState.inputField = 'valid';
    }
    if (!validation) {
      watchedState.inputField = 'invalid';
    }
    if (watchedState.inputValue === '') {
      watchedState.inputField = 'default';
    }
  });
};
