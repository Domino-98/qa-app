export default function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " lata";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " miesięcy";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " dni";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " godzin";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minut";
  }
  return Math.floor(seconds) + " sekund";
}
