import { useMatches } from 'react-router-dom';

export default function useTabMatch() {
  const matches = useMatches();

  const match = matches.at(-1)!;
  const paths = match.id.split('/').filter((path) => !path.startsWith('(') || !path.endsWith(')'));

  const tabURL = match.pathname.split('/').slice(0, paths.length).join('/').replace(/\/$/, '');
  const tabValue = (paths.at(-1) === 'index' ? '' : paths.at(-1)) ?? '';

  return { tabURL, tabValue };
}
