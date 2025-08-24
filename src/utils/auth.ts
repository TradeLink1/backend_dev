// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// // import { config } from "../config/env";

// export const hashPassword = async (password: string): Promise<string> => {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(password, salt);
// };

// export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
//   return bcrypt.compare(password, hashed);
// };

// export const generateToken = (userId: string) => {
//   return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "1h" });
// };
