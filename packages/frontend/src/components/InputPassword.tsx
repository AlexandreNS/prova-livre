import type { InputProps } from '@react-bulk/core';

import { useToggleState } from 'react-state-hooks';

import Icon from '@prova-livre/frontend/components/Icon';
import { Button, Input } from '@react-bulk/web';

export default function InputPassword({ inputStyle, ...rest }: InputProps) {
  const [secure, toggleSecure] = useToggleState(true);

  return (
    <Input
      secure={secure}
      endAddon={
        <Button
          circular
          accessibility={{ label: secure ? 'Mostrar senha' : 'Esconder senha' }}
          color="primary"
          mr={-2}
          variant="text"
          onPress={toggleSecure}
        >
          <Icon name={secure ? 'Eye' : 'EyeSlash'} size={20} />
        </Button>
      }
      inputStyle={[
        {
          // Esconder "olho" adicionado pelo MS Edge
          '&::-ms-reveal': { display: 'none' },
        },
        inputStyle,
      ]}
      {...rest}
    />
  );
}
