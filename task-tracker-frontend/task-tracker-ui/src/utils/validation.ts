export interface FieldErrors {
  [key: string]: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(values: {
  email: string;
  name: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!values.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}

export function validateLoginForm(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  }
  return errors;
}

export function validateTaskForm(values: { title: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required';
  }
  return errors;
}
