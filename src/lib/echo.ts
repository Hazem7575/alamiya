import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Pusher
window.Pusher = Pusher;

// Create Echo instance with Reverb configuration
const echo = new Echo({
  broadcaster: 'reverb',
  key: 'wtzhaggw2crbkiai2pwj',
  wsHost: 'alamiya.konhub.dev',
  wsPort: 9001,
  wssPort: 9001,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
  cluster: false,
});

export default echo;
