import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const res = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    
    if (res.data.status === 'success') {
      showAlert('success', `Tour booked successfully.`);
      window.setTimeout(() => {
        location.assign('/my-tours');
      }, 1500);
    } 

  } catch (err) {
    showAlert('error', err);
  }
};
