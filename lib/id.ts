import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
);

export const generateId = (size?: number | { length: number }) => {
  if (typeof size === "object" && size !== null) {
    return nanoid(size.length);
  }
  return nanoid(size);
};
