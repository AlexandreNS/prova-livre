import useParams from '@prova-livre/frontend/hooks/useParams';
import { number } from '@prova-livre/shared/helpers/number.helper';

export default function useIdParam(attr = 'id') {
  const value = useParams()?.[attr];
  const numeric = number(value);
  return value === `${numeric}` ? numeric : undefined;
}
