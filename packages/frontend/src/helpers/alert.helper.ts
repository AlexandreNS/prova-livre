export function alert(message = '') {
  window.alert(message);
  return true;
}

export function confirm(message = 'Deseja continuar?') {
  return window.confirm(message);
}
