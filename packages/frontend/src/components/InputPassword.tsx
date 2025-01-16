import type { InputProps } from '@react-bulk/core';

import { useState } from 'react';

import { Input } from '@react-bulk/web';

export default function InputPassword(props: InputProps) {
  const [secure, setSecure] = useState(true);

  return <Input required autoComplete="current-password" label="Senha Atual" name="currentPassword" secure={secure} />;
}
