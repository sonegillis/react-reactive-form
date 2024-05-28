import { FormEvent, RefObject, useEffect, useRef, useState } from 'react';
import { AsyncValidatorFn, ValidationFn, ValidationResult } from './Validators';

export interface Interaction {
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  value: string;
}

export interface useFormResult {
  inputFields: Record<string, Interaction>;
  setInputFields: (newState: Record<string, Interaction>) => void;
  inputFieldsErrorMsgs: Record<string, string[]>;
  setInputFieldsErrorMsgs: (newState: Record<string, string[]>) => void;
  handleChange: (e: FormEvent<HTMLInputElement>) => void;
  formRef: RefObject<HTMLFormElement>;
  isValid: boolean;
}

const initializeInputFields = (
  validations: Record<string, [string, ValidationFn[]?, AsyncValidatorFn[]?]>
) => {
  const fields: Record<string, Interaction> = {};
  const fieldsErrorMsgs: Record<string, string[]> = {};
  Object.keys(validations).forEach((key) => {
    fieldsErrorMsgs[key] = [];
    fields[key] = {
      dirty: false,
      touched: false,
      value: validations[key][0],
      valid: !(!!validations[key][1]?.length || !!validations[key][2]?.length),
    };
  });
  return { fields, fieldsErrorMsgs };
};

export type useFormType = (
  validations: Record<string, [string, ValidationFn[]?, AsyncValidatorFn[]?]>
) => useFormResult;

const useForm: useFormType = (
  validations: Record<string, [string, ValidationFn[]?, AsyncValidatorFn[]?]>
) => {
  const { fields, fieldsErrorMsgs } = initializeInputFields(validations);
  const [inputFields, setInputFields] =
    useState<Record<string, Interaction>>(fields);
  const [inputFieldsErrorMsgs, setInputFieldsErrorMsgs] =
    useState<Record<string, string[]>>(fieldsErrorMsgs);
  const [isValid, setIsValid] = useState<boolean>(false);
  const formRef: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const formEl = formRef.current;
    Object.keys(validations).forEach((key) => {
      const inputEl = formEl?.querySelector(
        `[name="${key}"]`
      ) as HTMLInputElement;
      inputEl?.addEventListener('focus', async () => {
        const validationResult = validateField(key, inputEl.value);
        updateFieldsAfterValidation(key, validationResult, 'focus');
        const asyncValidationResult = await asyncValidateField(
          key,
          inputEl.value
        );
        if (asyncValidationResult.length) {
          updateFieldsAfterValidation(
            key,
            [...asyncValidationResult, ...validationResult],
            'focus'
          );
        }

        return;
      });
    });

    return () => {
      Object.keys(validations).forEach((key) => {
        formEl
          ?.querySelector(`[name="${key}"]`)
          ?.removeEventListener('focus', () => {});
      });
    };
  }, []);

  const updateFieldsAfterValidation = (
    key: string,
    validationResult: string[],
    event: 'focus' | 'change'
  ) => {
    validationResult = Array.from(new Set(validationResult));
    setInputFieldsErrorMsgs((_inputFieldsErrorMsgs) => ({
      ..._inputFieldsErrorMsgs,
      [key]: validationResult,
    }));
    setInputFields((_inputFields) => {
      const validArr = Object.entries(_inputFields).map(([_key, value]) => {
        return key === _key ? validationResult.length === 0 : value.valid;
      });
      setIsValid(!validArr.some((valid) => valid === false));
      return {
        ..._inputFields,
        [key]: {
          ..._inputFields[key],
          touched: event === 'focus' ? true : _inputFields[key].touched,
          dirty: event === 'change' ? true : _inputFields[key].dirty,
          valid: validationResult.length === 0,
        },
      };
    });
  };

  const validateField = (name: string, value: string): string[] => {
    const fieldErrors: string[] = [];
    const fieldValidations = validations[name];
    if (fieldValidations.length > 1) {
      fieldValidations[1]?.forEach((validate) => {
        const validateErr = validate(value) as ValidationResult;
        if (validateErr.error) {
          fieldErrors.push(validateErr.msg);
        }
      });
    }
    return fieldErrors;
  };

  const asyncValidateField = async (
    name: string,
    value: string
  ): Promise<string[]> => {
    const fieldErrors: string[] = [];
    const fieldValidations = validations[name];

    if (fieldValidations.length > 2) {
      const aysncFieldValidations = fieldValidations[2]
        ? fieldValidations[2].map(async (validate) => validate(value))
        : [];
      const asyncValidationResults = await Promise.all(aysncFieldValidations);
      asyncValidationResults.forEach((validateErr: ValidationResult) => {
        if (validateErr.error) {
          fieldErrors.push((validateErr as ValidationResult).msg);
        }
      });
    }
    return fieldErrors;
  };

  const handleChange = async (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setInputFields((_inputFields) => ({
      ..._inputFields,
      [name]: {
        ..._inputFields[name],
        value,
        dirty: true,
      },
    }));
    const validationResult = validateField(name, value);
    updateFieldsAfterValidation(name, validationResult, 'change');
    const asyncValidationResult = await asyncValidateField(name, value);
    if (asyncValidationResult.length) {
      updateFieldsAfterValidation(
        name,
        [...asyncValidationResult, ...validationResult],
        'change'
      );
    }
  };

  return {
    inputFields,
    setInputFields,
    inputFieldsErrorMsgs,
    setInputFieldsErrorMsgs,
    handleChange,
    formRef,
    isValid,
  };
};

export default useForm;
