import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginInput = (req: Request, _res: Response, next: NextFunction): void => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return next(new AppError('Email is required', 400));
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return next(new AppError('Password is required', 400));
  }

  next();
};

export const validateRefreshInput = (req: Request, _res: Response, next: NextFunction): void => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.trim()) {
    return next(new AppError('Refresh token is required', 400));
  }

  next();
};

export const validateLogoutInput = (req: Request, _res: Response, next: NextFunction): void => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.trim()) {
    return next(new AppError('Refresh token is required to logout', 400));
  }

  next();
};
