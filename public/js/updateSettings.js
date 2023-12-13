import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  // type: 'password', 'data'

  const baseUrl = 'http://127.0.0.1:3000';
  const userApiUrl = 'api/v1/users';

  try {
    document.querySelector('.btn--green').textContent = 'Updating ...';

    const url =
      type === 'password'
        ? `/${userApiUrl}/updateMyPassword`
        : `/${userApiUrl}/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    document.querySelector('.btn--green').textContent = 'Saved';
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully.`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
