import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';

import Html from '@prova-livre/frontend/components/Html';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { groupBy } from '@prova-livre/shared/helpers/array.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { string, stripTags } from '@prova-livre/shared/helpers/string.helper';
import {
  type AnyObject,
  type InputProps,
  type InputValue,
  type RbkInputEvent,
  type RbkKeyboardEvent,
  type RbkPointerEvent,
  type ReactElement,
  type SelectOption,
  useForm,
  useHtmlId,
} from '@react-bulk/core';
import { Box, Card, Divider, Input, Loading, Scrollable, Text } from '@react-bulk/web';

export type InputFetchProps = {
  customLabel?: (item: any) => ReactElement;
  groupByAttr?: string;
  groupByLabelAttr?: string;
  labelAttr?: string;
  onChange?: (event: RbkPointerEvent, value: InputValue, option?: SelectOption | null) => any;
  params?: AnyObject;
  required?: boolean;
  url: string;
  valueAttr?: string;
} & Omit<InputProps<false>, 'onChange'>;

export default function InputFetch({
  name,
  required,
  value,
  url,
  labelAttr = 'name',
  valueAttr = 'id',
  params,
  placeholder = 'Comece a digitar...',
  onChange,
  groupByAttr,
  groupByLabelAttr,
  customLabel,
  ...rest
}: InputFetchProps) {
  const elId = `input-fetch-${useHtmlId()}`;
  const inputSearchRef = useRef<HTMLInputElement>();
  const form = useForm();

  const [search, setSearch] = useState<string>();
  const searchDeferred = useDeferredValue(search);

  const [selectedId, setSelectedId] = useState<null | number>(value);
  const [focusedItem, setFocusedItem] = useState<SelectOption>();
  const [error, setError] = useState<boolean | null | string | undefined>();

  const isVisible = !selectedId && Boolean(search);

  const { data: items, isLoading } = useRequest<any>(searchDeferred && url, {
    params: {
      ...params,
      limit: 100,
      search: searchDeferred,
    },
  });

  const { data: selected } = useRequest(selectedId && `${url}/${selectedId}`, {
    autoRevalidate: false,
  });

  const groups = groupBy<any>(items?.rows ?? [], groupByAttr || '---', groupByLabelAttr || '---');

  useEffect(() => {
    if (!selected) return;
    setSearch(stripTags(string(selected?.[labelAttr])));
  }, [labelAttr, selected]);

  const handleBlur = useCallback(() => {
    if (selected) return;
    setTimeout(() => setSearch(undefined), 100);
  }, [selected]);

  const handleChangeSearch = useCallback(
    (e: RbkInputEvent, value: InputValue) => {
      setSearch(value);

      if (value !== search) {
        setSelectedId(null);
        setFocusedItem(undefined);
      }
    },
    [search],
  );

  const handleSelectOption = useCallback(
    (e: RbkPointerEvent, item: SelectOption) => {
      setSelectedId(item.value);
      setSearch(string(item.label));
      setFocusedItem(undefined);

      onChange?.(e, item.value, item);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: RbkKeyboardEvent) => {
      if (!isVisible) return;
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;

      e.preventDefault();

      const items = groups.map(({ data }) => data).flat();
      let index = items.findIndex((item) => item[valueAttr] === focusedItem?.value);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        index++;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        index--;
      }

      if (index < 0) {
        index = 0;
      }

      if (index >= items.length) {
        index = items.length - 1;
      }

      document.querySelectorAll(`#${elId} .list-item`)?.[index].scrollIntoView({
        block: 'center',
        inline: 'center',
      });

      setFocusedItem({
        value: items[index]?.[valueAttr],
        label: items[index]?.[labelAttr],
      });
    },
    [elId, focusedItem?.value, groups, isVisible, labelAttr, valueAttr],
  );

  const getError = useCallback(() => {
    setError(form?.getErrors()?.name);
  }, [form]);

  useEffect(() => {
    if (!name || !form) return;

    form.setField({
      name,
      set: () => {},
      setError,
      get: getError,
    });

    return () => {
      form.unsetField(name);
    };
  }, [name, form, getError]);

  return (
    <Box id={elId} position="relative">
      <Input controlled name={name} type="hidden" value={selectedId} onChange={(_, value) => setSelectedId(value)} />

      <Input
        autoComplete="off"
        {...rest}
        ref={inputSearchRef}
        controlled
        endAddon={isLoading ? <Loading /> : null}
        error={error}
        placeholder={placeholder}
        required={required}
        startAddon={selectedId ? <Text variant="secondary">#{selectedId}</Text> : null}
        value={search ?? stripTags(selected?.[labelAttr])}
        // onBlur={handleBlur}
        onChange={handleChangeSearch}
        onKeyDown={handleKeyDown}
        onSubmit={() => focusedItem && setSelectedId(focusedItem?.value)}
      />

      {isVisible && (
        <Card
          maxh={240}
          overflow="hidden"
          p={0}
          position="absolute"
          w="100%"
          zIndex={2}
          style={
            number(inputSearchRef.current?.getBoundingClientRect()?.top) > window.innerHeight / 2
              ? { bottom: '100%' }
              : { top: '100%' }
          }
        >
          <Scrollable contentInset="1gap">
            {!isLoading && !items?.rows?.length && <Text variant="secondary">Nenhum resultado encontrado.</Text>}

            {groups.map(({ key, data, title }, groupIndex) => (
              <Box key={key ?? groupIndex}>
                {Boolean(groupByAttr) && (
                  <>
                    {groupIndex > 0 && <Divider mx="-1gap" my="1gap" />}

                    <Text bold bg="background" mb="1gap" position="sticky" t={0} variant="secondary" zIndex={1}>
                      {title}
                    </Text>
                  </>
                )}

                {data.map((item, itemIndex) => {
                  const value = item[valueAttr];
                  const label = item[labelAttr];

                  return (
                    <Box key={value ?? itemIndex} ml={groupByAttr ? '1gap' : 0}>
                      {itemIndex > 0 && <Divider />}

                      <Box
                        className="list-item"
                        corners={1}
                        mx={-2}
                        p={2}
                        style={focusedItem?.value === value && { bg: 'primary.main.15' }}
                        onPress={(e) =>
                          handleSelectOption(e, {
                            value,
                            label,
                          })
                        }
                      >
                        {customLabel && typeof customLabel === 'function' ? (
                          customLabel(item)
                        ) : (
                          <Box row alignItems="center">
                            <Text mr={1} variant="secondary">
                              #{value}
                            </Text>
                            <Html fontWeight="500" html={stripTags(label)} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Scrollable>
        </Card>
      )}
    </Box>
  );
}
