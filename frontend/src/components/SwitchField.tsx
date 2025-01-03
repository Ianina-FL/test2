import React, { useEffect, useId, useState } from 'react';
import Switch from 'react-switch';

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
const fullConfig = resolveConfig(tailwindConfig as any);

export const SwitchField = ({ field, form, disabled }) => {
  const handleChange = (data: any) => {
    form.setFieldValue(field.name, data);
  };

  const buttonColor =
    fullConfig.theme.accentColor.pastelEmeraldTheme?.buttonColor;
  const cardColor = fullConfig.theme.accentColor.pastelEmeraldTheme?.cardColor;

  return (
    <Switch
      checkedIcon={false}
      uncheckedIcon={false}
      className={'check'}
      onChange={handleChange}
      onColor={buttonColor}
      offColor={cardColor}
      checked={!!field?.value}
      disabled={disabled}
    />
  );
};
