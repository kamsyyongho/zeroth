import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@material-ui/core";
import { FieldProps, getIn } from "formik";
import React from "react";

export interface SelectFormFieldOption {
  label: string;
  value: string | number;
}

export type SelectFormFieldOptions = Array<SelectFormFieldOption>;

interface SelectFormFieldProps extends FieldProps {
  errorOverride?: boolean;
  fullWidth?: boolean;
  label?: string;
  options: SelectFormFieldOptions;
}

export const SelectFormField = ({ field, form, label, options, errorOverride, fullWidth, ...props }: SelectFormFieldProps) => {
  if (fullWidth === undefined) fullWidth = true;
  const errorText =
    getIn(form.touched, field.name) && getIn(form.errors, field.name);
  return (
    <FormControl fullWidth={fullWidth} error={!!errorText || !!errorOverride}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select fullWidth={fullWidth} {...field} {...props}>
        {options.map((op: SelectFormFieldOption) => {
          // account for blank options
          if (op.value === '') {
            return (<MenuItem key={'empty'} value={op.value}>
              <em>{op.label}</em>
            </MenuItem>);
          }
          return (<MenuItem key={op.value} value={op.value}>
            {op.label}
          </MenuItem>);
        })}
      </Select>
      <FormHelperText>{errorText}</FormHelperText>
    </FormControl>
  );
};