import { useMatches } from 'react-router-dom';

export default function useTabMatch() {
  const matches = useMatches();

  const match = matches.at(-1)!;
  const paths = match.id.split('/');

  const tabURL = match.pathname.split('/').slice(0, paths.length).join('/');
  const tabValue = (paths.at(-1) === 'index' ? '' : paths.at(-1)) ?? '';

  return { tabURL, tabValue };
}
