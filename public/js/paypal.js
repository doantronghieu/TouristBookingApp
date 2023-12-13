import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const res = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    
    console.log(res);
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
