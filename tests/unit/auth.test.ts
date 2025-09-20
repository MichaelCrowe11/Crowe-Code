import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'

describe('Authentication Functions', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)
      
      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(20)
    })
    
    it('should verify a correct password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(password, hashed)
      
      expect(isValid).toBe(true)
    })
    
    it('should reject an incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hashed)
      
      expect(isValid).toBe(false)
    })
  })
  
  describe('JWT Token', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    }
    
    it('should generate a token', () => {
      const token = generateToken(mockUser)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })
    
    it('should verify a valid token', () => {
      const token = generateToken(mockUser)
      const payload = verifyToken(token)
      
      expect(payload).toBeDefined()
      expect(payload?.id).toBe(mockUser.id)
      expect(payload?.email).toBe(mockUser.email)
      expect(payload?.name).toBe(mockUser.name)
      expect(payload?.role).toBe(mockUser.role)
    })
    
    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const payload = verifyToken(invalidToken)
      
      expect(payload).toBeNull()
    })
  })
})