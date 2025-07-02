/**
 * Authentication utilities for the admin section
 * This module provides functions for user authentication and session management
 */

import { prisma } from './db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - Optional user name
 * @property {string} role - User role (admin, etc)
 */

// prisma client is imported from db.js

/**
 * Authenticate a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<User|null>} User object or null if authentication fails
 */
export async function authenticateUser(email, password) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    });

    // If user not found or password doesn't match, return null
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return /** @type {User} */ (userWithoutPassword);
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Create a session for a user
 * @param {User} user - User object
 * @returns {Promise<{id: string, token: string, userId: string, expiresAt: Date}>} Session object
 */
export async function createSession(user) {
  try {
    // Generate a random token
    const token = crypto.randomBytes(64).toString('hex');
    
    // Create a new session
    const session = await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    return session;
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

/**
 * Validate a session token
 * @param {string} token - Session token
 * @returns {Promise<User|null>} User object or null if session is invalid
 */
export async function validateSession(token) {
  try {
    // Find session by token
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });
    
    // If session not found or expired, return null
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = session.user;
    return /** @type {User} */ (userWithoutPassword);
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Delete a session
 * @param {string} token - Session token
 * @returns {Promise<boolean>} True if session was deleted
 */
export async function deleteSession(token) {
  try {
    await prisma.session.delete({
      where: { token }
    });
    return true;
  } catch (error) {
    console.error('Session deletion error:', error);
    return false;
  }
}

/**
 * Hash a password
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
