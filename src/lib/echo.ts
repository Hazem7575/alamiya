import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Pusher
window.Pusher = Pusher;

// Create Echo instance with Reverb configuration
const echo = new Echo({
  broadcaster: 'reverb',
  key: 'wtzhaggw2crbkiai2pwj',
  wsHost: '127.0.0.1',
  wsPort: 9001,
  wssPort: 9001,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  cluster: 'mt1',
});

export default echo;
