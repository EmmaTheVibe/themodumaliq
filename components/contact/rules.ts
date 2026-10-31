export const LIMITS = { name: 80, email: 254, message: 1500 } as const;

export const MESSAGE_MIN = 10;

export const NAME_PATTERN = /^[\p{L}\p{M}](?:[\p{L}\p{M}'’. -]*[\p{L}\p{M}.])?$/u;

export const EMAIL_PATTERN =
  /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
