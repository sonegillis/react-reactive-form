import React, { FormEvent, useEffect } from 'react';
import './RegistrationForm.css'; // Import your CSS file for styling
import useForm, { useFormResult } from '../ReactiveForm/useForm';
import {
  AsyncValidatorFn,
  ValidationResult,
  Validators,
} from '../ReactiveForm/Validators';

const existingUsers = [
  'pixelpioneer',
  'techtraveler',
  'codecrafter',
  'digitaldreamer',
  'bytebuilder',
  'nerdynavigator',
  'geekyguru',
  'circuitsage',
  'binaryboss',
  'techietitan',
];

const asyncValidateUsername = (msg: string): AsyncValidatorFn => {
  return (value: string): Promise<ValidationResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => resolve({ error: existingUsers.includes(value), msg }),
        2000
      );
    });
  };
};

const RegistrationForm = () => {
  const {
    inputFields,
    inputFieldsErrorMsgs,
    handleChange,
    formRef,
    isValid,
  }: useFormResult = useForm({
    fullName: ['', [Validators.validateRequired()]],
    company: [''],
    username: [
      '',
      [Validators.validateRequired()],
      [asyncValidateUsername('User with username already exists')],
    ],
    email: ['', [Validators.validateRequired(), Validators.validateEmail()]],
    password: ['', [Validators.validateRequired()]],
  });

  useEffect(() => {}, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="registration-form">
      {/* {JSON.stringify(inputFields)}
      {JSON.stringify(inputFieldsErrorMsgs)}
      {JSON.stringify(isValid)} */}
      <h2>Register</h2>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="form-group">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={inputFields.fullName.value}
            onChange={handleChange}
          />
          {inputFields?.fullName?.touched && !inputFields?.fullName?.valid && (
            <p className="error">
              {inputFieldsErrorMsgs?.fullName.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </p>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={inputFields.company.value}
            onChange={handleChange}
          />
          {inputFields?.company?.touched && !inputFields?.company?.valid && (
            <p className="error">
              {inputFieldsErrorMsgs?.company.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </p>
          )}
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={inputFields.email.value}
            onChange={handleChange}
          />
          {inputFields?.email?.touched && !inputFields?.email?.valid && (
            <p className="error">
              {inputFieldsErrorMsgs?.email.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </p>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={inputFields.username.value}
            onChange={handleChange}
          />
          {inputFields?.username?.touched && !inputFields?.username?.valid && (
            <p className="error">
              {inputFieldsErrorMsgs?.username.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </p>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={inputFields.password.value}
            onChange={handleChange}
          />
          {inputFields?.password?.touched && !inputFields?.password?.valid && (
            <p className="error">
              {inputFieldsErrorMsgs?.password.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </p>
          )}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
