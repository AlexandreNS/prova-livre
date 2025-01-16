import { Children, type ReactElement, cloneElement } from 'react';
import { Link, NavLink } from 'react-router-dom';

export type LinkChildProps = {
  children: ReactElement;
  component?: typeof Link | typeof NavLink;
  href: null | string | undefined;
  replace?: boolean;
  state?: any;
  target?: '_blank' | '_parent' | '_self' | '_top' | string;
};

export default function LinkChild({ children, component = Link, href, state, target, replace }: LinkChildProps) {
  const element = cloneElement(Children.only(children), {
    state,
    target,
    replace,
    to: href,
  });

  return href ? <element.type component={component} {...element.props} /> : children;
}
