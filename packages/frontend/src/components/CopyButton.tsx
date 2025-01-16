import { useEffect, useRef, useState } from 'react';

import Icon from '@prova-livre/frontend/components/Icon';
import { string } from '@prova-livre/shared/helpers/string.helper';
import { type ButtonProps, type RbkPointerEvent, type TimeoutType } from '@react-bulk/core';
import { Button, Tooltip } from '@react-bulk/web';

export type CopyButtonProps = {
  value: null | number | string | undefined;
} & ButtonProps<false>;

export default function CopyButton({ value, ...rest }: CopyButtonProps) {
  const timeoutRef = useRef<TimeoutType>();

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutRef]);

  const handleCopyToken = async (_: RbkPointerEvent, token: string) => {
    setIsCopied(true);
    await navigator.clipboard.writeText(token);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Tooltip title={isCopied ? 'Copiado' : 'Copiar'}>
      <Button
        circular
        size="small"
        variant="text"
        {...rest}
        startAddon={({ color }) => <Icon color={color} name={isCopied ? 'Check' : 'Copy'} weight="bold" />}
        onPress={(e) => handleCopyToken(e, string(value))}
      />
    </Tooltip>
  );
}
