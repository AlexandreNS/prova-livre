import { useCallback, useEffect, useMemo, useRef } from 'react';

import { variantRequired } from '@prova-livre/frontend/themes/createTheme';
import { type InputProps, jss, useInput, useTheme } from '@react-bulk/core';
import { Label, Text } from '@react-bulk/web';
import JoditEditor, { type IJoditEditorProps } from 'jodit-react';

export type InputHtmlProps = {
  minHeight?: number;
  required?: boolean;
} & Pick<InputProps, 'autoFocus' | 'disabled' | 'label' | 'name' | 'onChange' | 'placeholder' | 'readOnly' | 'value'>;

export default function InputHtml({
  label,
  name,
  value,
  placeholder = '',
  required,
  autoFocus,
  readOnly: readonly,
  minHeight,
  disabled,
  onChange,
}: InputHtmlProps) {
  const theme = useTheme();

  const editorRef = useRef<any>(null);

  const input = useInput({
    name,
    onChange,
    value,
    editable: !readonly && !disabled,
  });

  const config: IJoditEditorProps['config'] = useMemo(
    () => ({
      editorRef,
      disabled,
      readonly,
      placeholder,
      minHeight,
      theme: theme.mode,
      language: 'pt_br',
      addNewLine: false,
      hidePoweredByJodit: true,
      removeButtons: ['fullsize', 'about'],
      containerStyle: jss(theme.components.InputBase.defaultStyles.content),
    }),
    [disabled, readonly, placeholder, minHeight, theme.mode, theme.components.InputBase.defaultStyles.content],
  );

  useEffect(() => {
    if (!editorRef.current) return;
    if (!autoFocus || disabled || readonly) return;

    editorRef.current?.closest('.jodit-react-container')?.querySelector('[contenteditable="true"]')?.focus();
  }, [editorRef, autoFocus, disabled, readonly]);

  const handleChange = useCallback(
    async (value: string) => {
      const empty = '<p><br></p>';
      const regexStart = new RegExp(`^${empty}`, 'g');
      const regexEnd = new RegExp(`${empty}$`, 'g');

      while (regexStart.test(value)) {
        value = value.replace(regexStart, '');
      }

      while (regexEnd.test(value)) {
        value = value.replace(regexEnd, '');
      }

      input.setState(value);
    },
    [input],
  );

  return (
    <>
      {Boolean(label) && (
        <Label mb={1} style={Boolean(required) && variantRequired.required.true.label}>
          {label}
        </Label>
      )}

      <JoditEditor ref={editorRef} config={config} value={input.state} onChange={handleChange} />

      {Boolean(input.error) && (
        <Text color="error" m={1} variant="caption">
          {input.error}
        </Text>
      )}
    </>
  );
}
