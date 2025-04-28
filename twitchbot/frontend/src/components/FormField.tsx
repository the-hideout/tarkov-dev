import React from 'react';
import { useField } from 'formik';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';

interface BaseFieldProps {
  name: string;
  label: string;
  helperText?: string;
}

interface TextFieldComponentProps extends BaseFieldProps {
  type?: TextFieldProps['type'];
  multiline?: boolean;
  rows?: number;
  variant?: TextFieldProps['variant'];
  fieldType: 'text';
}

interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string | number; label: string }>;
  fieldType: 'select';
}

interface SwitchFieldProps extends BaseFieldProps {
  fieldType: 'switch';
}

type FormFieldProps = TextFieldComponentProps | SelectFieldProps | SwitchFieldProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const [field, meta] = useField(props.name);
  const isError = meta.touched && !!meta.error;

  switch (props.fieldType) {
    case 'text':
      return (
        <TextField
          {...field}
          label={props.label}
          type={props.type || 'text'}
          multiline={props.multiline}
          rows={props.rows}
          variant={props.variant || 'outlined'}
          fullWidth
          error={isError}
          helperText={isError ? meta.error : props.helperText}
          sx={{ mb: 2 }}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={isError} sx={{ mb: 2 }}>
          <InputLabel>{props.label}</InputLabel>
          <Select {...field} label={props.label}>
            {props.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(isError || props.helperText) && (
            <FormHelperText>{isError ? meta.error : props.helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControl fullWidth error={isError} sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value}
              />
            }
            label={props.label}
          />
          {(isError || props.helperText) && (
            <FormHelperText>{isError ? meta.error : props.helperText}</FormHelperText>
          )}
        </FormControl>
      );

    default:
      return null;
  }
};

export default FormField; 