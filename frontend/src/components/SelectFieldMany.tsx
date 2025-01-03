import React, { useEffect, useId, useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import axios from 'axios';

export const SelectFieldMany = ({
  options,
  field,
  form,
  itemRef,
  showField,
}) => {
  const [value, setValue] = useState([]);
  const PAGE_SIZE = 100;

  useEffect(() => {
    if (field.value?.[0] && typeof field.value[0] !== 'string') {
      form.setFieldValue(
        field.name,
        field.value.map((el) => el.id),
      );
    }
  }, [field.name, field.value, form]);

  useEffect(() => {
    if (options) {
      setValue(options.map((el) => ({ value: el.id, label: el[showField] })));
      form.setFieldValue(
        field.name,
        options.map((el) => ({ value: el.id, label: el[showField] })),
      );
    }
  }, [options]);

  const mapResponseToValuesAndLabels = (data) => ({
    value: data.id,
    label: data.label,
  });

  const handleChange = (data: any) => {
    setValue(data);
    form.setFieldValue(
      field.name,
      data.map((el) => el.value),
    );
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
      classNamePrefix='react-select'
      instanceId={useId()}
      value={value}
      isMulti
      debounceTimeout={1000}
      loadOptions={callApi}
      onChange={handleChange}
      defaultOptions
    />
  );
};
