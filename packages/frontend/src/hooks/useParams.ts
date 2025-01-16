import { useLocation, useSearchParams } from 'react-router-dom';

import { useParams as useRouterParams } from '@prova-livre/frontend/router';

export default function useParams() {
  const location = useLocation();

  // @ts-expect-error
  const routeParams = (useRouterParams() as { [key: string]: string }) || {};
  const searchParams = Object.fromEntries(useSearchParams()[0].entries());
  const stateParams = location.state instanceof Object && !Array.isArray(location.state) ? location.state : {};

  return {
    ...stateParams,
    ...searchParams,
    ...routeParams,
  } as { [key: string]: string };
}
