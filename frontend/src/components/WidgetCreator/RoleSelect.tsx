import React, { useEffect, useId, useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import axios from 'axios';

export const RoleSelect = ({
  options,
  field,
  form,
  itemRef,
  disabled,
  currentUser,
}) => {
  const [value, setValue] = useState(null);
  const PAGE_SIZE = 100;

  React.useEffect(() => {
    if (currentUser.app_role.id) {
      setValue({
        value: currentUser.app_role.id,
        label: currentUser.app_role.name,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (options?.value && options?.label) {
      setValue({ value: options.value, label: options.label });
    }
  }, [options?.id, field?.value?.id]);

  const mapResponseToValuesAndLabels = (data) => ({
    value: data.id,
    label: data.label,
  });
  const handleChange = (option) => {
    form.setFieldValue(field.name, option);
    setValue(option);
  };

  async function callApi(inputValue: string, loadedOptions: any[]) {
    const path = `/${itemRef}/autocomplete?limit=${PAGE_SIZE}&offset=${
      loadedOptions.length
    }${inputValue ? `&query=${inputValue}` : ''}`;
    const { data } = await axios(path);
    return {
      options: data.map(mapResponseToValuesAndLabels),
      hasMore: data.length === PAGE_SIZE,
    };
  }
  return (
    <AsyncPaginate
      classNames={{
        control: () => 'px-1 py-2',
      }}
      classNamePrefix={'react-select'}
      instanceId={useId()}
      value={value}
      debounceTimeout={1000}
      loadOptions={callApi}
      onChange={handleChange}
      defaultOptions
      isDisabled={disabled}
    />
  );
};
