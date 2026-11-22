
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Mengubah password menjadi hash
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Membandingkan password dengan hash di database
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
