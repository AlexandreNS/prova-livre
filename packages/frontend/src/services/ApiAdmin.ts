import { api } from '@prova-livre/frontend/helpers/api.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';

const baseURL = string(import.meta.env.VITE_AVALIFY_API_URL).replace(/\/$/, '') + '/admin';

const ApiAdmin = api({
  baseURL,
});

export default ApiAdmin;
