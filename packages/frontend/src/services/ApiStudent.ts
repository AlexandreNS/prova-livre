import { api } from '@prova-livre/frontend/helpers/api.helper';
import { string } from '@prova-livre/shared/helpers/string.helper';

const baseURL = string(import.meta.env.VITE_PROVA_LIVRE_API_URL).replace(/\/$/, '') + '/student';

const ApiStudent = api({
  baseURL,
});

export default ApiStudent;
