import { required } from "../deps.ts";

const registrationSchema = {
  name: [required],
  email: [required],
  password: [required],
};

const loginSchema = {
  email: [required],
  password: [required],
};

const updateSchema = {
  name: [required],
  email: [required],
};

const recoverySchema = {
  email: [required],
};

export { loginSchema, recoverySchema, registrationSchema, updateSchema };
