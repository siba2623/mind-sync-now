# Technical Security Implementation Guide
## MindSync Mental Health Platform

**Version:** 1.0  
**Last Updated:** January 2025  
**Classification:** Technical Architecture Document

---

## Executive Summary

This document provides detailed technical specifications for implementing the security and data architecture outlined in the research framework. It includes code examples, configuration templates, and step-by-step implementation guides.

---

## 1. Database Setup with Encryption

### PostgreSQL Configuration

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_audit;

-- Create encryption key management table
CREATE TABLE encryption_keys (
    key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_purpose VARCHAR(50) NOT NULL,
    key_encrypted BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotated_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active'
);

-- Function to encrypt data
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key_id UUID)
RETURNS BYTEA AS $$
DECLARE
    encryption_key BYTEA;
BEGIN
    SELECT key_encrypted INTO encryption_key 
    FROM encryption_keys 
    WHERE encryption_keys.key_id = $2 AND status = 'active';
    
    RETURN pgp_sym_encrypt(data, encryption_key::TEXT);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt data
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data BYTEA, key_id UUID)
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA;
BEGIN
    SELECT key_encrypted INTO encryption_key 
    FROM encryption_keys 
    WHERE encryption_keys.key_id = $2 AND status = 'active';
    
    RETURN pgp_sym_decrypt(encrypted_data, encryption_key::TEXT);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```



### Core Tables with Security

```sql
-- Users table with encryption and hashing
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_hash VARCHAR(64) NOT NULL UNIQUE,
    email_encrypted BYTEA NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret_encrypted BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    data_retention_days INTEGER DEFAULT 2555,
    consent_version VARCHAR(10) NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on email_hash for fast lookup
CREATE INDEX idx_users_email_hash ON users(email_hash);

-- Mood tracking with encryption
CREATE TABLE mood_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
    notes_encrypted BYTEA,
    context JSONB,
    location_encrypted BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_at TIMESTAMP WITH TIME ZONE
);

-- Enable row-level security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY user_mood_isolation ON mood_entries
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Therapist access policy (with explicit permission)
CREATE POLICY therapist_mood_access ON mood_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM therapist_client_relationships tcr
            WHERE tcr.client_id = mood_entries.user_id
            AND tcr.therapist_id = current_setting('app.current_user_id')::UUID
            AND tcr.status = 'active'
            AND tcr.data_access_granted = TRUE
        )
    );
```

---

## 2. Application-Level Encryption (Node.js/TypeScript)

### Encryption Service

```typescript
// services/encryption.ts
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 32;
  private tagLength = 16;

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  async encrypt(plaintext: string, masterKey: string): Promise<string> {
    // Generate random salt and IV
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);

    // Derive encryption key from master key using scrypt
    const key = (await scrypt(masterKey, salt, this.keyLength)) as Buffer;

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  }

  /**
   * Decrypt data encrypted with encrypt()
   */
  async decrypt(encryptedData: string, masterKey: string): Promise<string> {
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = combined.subarray(0, this.saltLength);
    const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = combined.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength);

    // Derive decryption key
    const key = (await scrypt(masterKey, salt, this.keyLength)) as Buffer;

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt data
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash email for lookup (SHA-256)
   */
  hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export const encryptionService = new EncryptionService();
```

### Usage Example

```typescript
// Example: Storing encrypted journal entry
import { encryptionService } from './services/encryption';
import { supabase } from './integrations/supabase/client';

async function saveJournalEntry(userId: string, content: string) {
  // Get user's encryption key from secure storage
  const masterKey = process.env.ENCRYPTION_MASTER_KEY!;
  
  // Encrypt the journal content
  const encryptedContent = await encryptionService.encrypt(content, masterKey);
  
  // Store in database
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      content_encrypted: encryptedContent,
      created_at: new Date().toISOString()
    });
  
  if (error) throw error;
  return data;
}

async function getJournalEntry(entryId: string) {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY!;
  
  // Retrieve from database
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('entry_id', entryId)
    .single();
  
  if (error) throw error;
  
  // Decrypt content
  const decryptedContent = await encryptionService.decrypt(
    data.content_encrypted,
    masterKey
  );
  
  return {
    ...data,
    content: decryptedContent
  };
}
```

---

## 3. Authentication & Authorization

### Multi-Factor Authentication Setup

```typescript
// services/mfa.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  /**
   * Generate MFA secret for user
   */
  async generateSecret(userEmail: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MindSync (${userEmail})`,
      issuer: 'MindSync',
      length: 32
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before/after for clock drift
    });
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // Check if code exists and hasn't been used
    const { data, error } = await supabase
      .from('mfa_backup_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code_hash', this.hashBackupCode(code))
      .eq('used', false)
      .single();

    if (error || !data) return false;

    // Mark code as used
    await supabase
      .from('mfa_backup_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('code_id', data.code_id);

    return true;
  }

  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
}

export const mfaService = new MFAService();
```

### JWT Token Management

```typescript
// services/auth.ts
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class AuthService {
  private accessTokenExpiry = '15m';
  private refreshTokenExpiry = '30d';
  private jwtSecret = process.env.JWT_SECRET!;
  private jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(userId: string, role: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Generate access token
    const accessToken = jwt.sign(
      { userId, role, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.accessTokenExpiry, algorithm: 'RS256' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry, algorithm: 'RS256' }
    );

    // Store refresh token in Redis with expiry
    await redis.setex(
      `refresh_token:${userId}`,
      30 * 24 * 60 * 60, // 30 days in seconds
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): { userId: string; role: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['RS256']
      }) as any;

      if (decoded.type !== 'access') return null;

      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret, {
        algorithms: ['RS256']
      }) as any;

      if (decoded.type !== 'refresh') return null;

      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (storedToken !== refreshToken) return null;

      // Get user role from database
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', decoded.userId)
        .single();

      if (!user) return null;

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, role: user.role, type: 'access' },
        this.jwtSecret,
        { expiresIn: this.accessTokenExpiry, algorithm: 'RS256' }
      );

      return accessToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke all tokens for user (logout)
   */
  async revokeTokens(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`);
  }

  /**
   * Check if user account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('account_locked_until')
      .eq('user_id', userId)
      .single();

    if (!data || !data.account_locked_until) return false;

    return new Date(data.account_locked_until) > new Date();
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(userId: string): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('failed_login_attempts')
      .eq('user_id', userId)
      .single();

    if (!user) return;

    const attempts = (user.failed_login_attempts || 0) + 1;

    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes

      await supabase
        .from('users')
        .update({
          failed_login_attempts: attempts,
          account_locked_until: lockUntil.toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('users')
        .update({ failed_login_attempts: attempts })
        .eq('user_id', userId);
    }
  }

  /**
   * Reset failed login attempts on successful login
   */
  async resetFailedLogins(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
}

export const authService = new AuthService();
```

---

## 4. Audit Logging

### Comprehensive Audit System

```typescript
// services/audit.ts
export class AuditService {
  /**
   * Log user action
   */
  async logAction(params: {
    userId: string;
    action: string;
    tableName: string;
    recordId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const { data, error } = await supabase
      .from('audit_log')
      .insert({
        user_id: params.userId,
        action: params.action,
        table_name: params.tableName,
        record_id: params.recordId,
        changes: params.changes,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log data access
   */
  async logDataAccess(
    userId: string,
    dataType: string,
    recordId: string,
    purpose: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: 'DATA_ACCESS',
      tableName: dataType,
      recordId,
      changes: { purpose }
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    userId: string | null,
    eventType: string,
    details: any,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    await supabase.from('security_events').insert({
      user_id: userId,
      event_type: eventType,
      details,
      severity,
      timestamp: new Date().toISOString()
    });

    // Alert security team for high/critical events
    if (severity === 'high' || severity === 'critical') {
      await this.alertSecurityTeam(eventType, details);
    }
  }

  private async alertSecurityTeam(eventType: string, details: any): Promise<void> {
    // Send alert via email, Slack, PagerDuty, etc.
    console.log(`SECURITY ALERT: ${eventType}`, details);
  }
}

export const auditService = new AuditService();
```

---

## 5. Rate Limiting & DDoS Protection

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

// Limiter for sensitive operations
export const sensitiveLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:sensitive:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Rate limit exceeded for sensitive operations.'
});
```

---

## 6. Data Retention & Deletion

```typescript
// services/dataRetention.ts
export class DataRetentionService {
  /**
   * Schedule data deletion for user
   */
  async scheduleDataDeletion(userId: string, deletionDate: Date): Promise<void> {
    await supabase.from('data_deletion_queue').insert({
      user_id: userId,
      scheduled_deletion_date: deletionDate.toISOString(),
      status: 'pending'
    });
  }

  /**
   * Execute data deletion (run as cron job)
   */
  async executeScheduledDeletions(): Promise<void> {
    const { data: deletions } = await supabase
      .from('data_deletion_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_deletion_date', new Date().toISOString());

    for (const deletion of deletions || []) {
      try {
        await this.deleteUserData(deletion.user_id);
        
        await supabase
          .from('data_deletion_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('deletion_id', deletion.deletion_id);
      } catch (error) {
        console.error(`Failed to delete data for user ${deletion.user_id}:`, error);
        
        await supabase
          .from('data_deletion_queue')
          .update({ status: 'failed', error_message: error.message })
          .eq('deletion_id', deletion.deletion_id);
      }
    }
  }

  /**
   * Delete all user data (GDPR Right to Erasure)
   */
  private async deleteUserData(userId: string): Promise<void> {
    // Delete from all tables (cascading deletes handled by foreign keys)
    await supabase.from('users').delete().eq('user_id', userId);
    
    // Log deletion for compliance
    await supabase.from('deletion_log').insert({
      user_id: userId,
      deleted_at: new Date().toISOString(),
      deletion_method: 'user_request'
    });
  }

  /**
   * Anonymize user data (alternative to deletion for research)
   */
  async anonymizeUserData(userId: string): Promise<void> {
    // Replace identifiable information with pseudonyms
    const pseudonymId = crypto.randomUUID();
    
    await supabase
      .from('users')
      .update({
        email_encrypted: null,
        email_hash: null,
        anonymized: true,
        pseudonym_id: pseudonymId
      })
      .eq('user_id', userId);
    
    // Keep mood data but link to pseudonym
    await supabase
      .from('mood_entries')
      .update({ user_id: pseudonymId })
      .eq('user_id', userId);
  }
}

export const dataRetentionService = new DataRetentionService();
```

---

## 7. Environment Configuration

### .env.example

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://mindsync.app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mindsync
DATABASE_SSL=true

# Encryption
ENCRYPTION_MASTER_KEY=<generate-with-openssl-rand-base64-32>
JWT_SECRET=<generate-with-openssl-rand-base64-64>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-64>

# Redis
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS (for KMS, S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_KMS_KEY_ID=your-kms-key-id

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://mindsync.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# MFA
MFA_ISSUER=MindSync
MFA_WINDOW=2

# Compliance
DATA_RETENTION_DAYS=2555
GDPR_ENABLED=true
HIPAA_ENABLED=true
```

---

## 8. Deployment Checklist

### Pre-Production Security Audit

- [ ] All environment variables set and secured
- [ ] Database encryption enabled (TDE)
- [ ] SSL/TLS certificates installed and configured
- [ ] Firewall rules configured (whitelist only necessary ports)
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS configured with specific origins
- [ ] Content Security Policy (CSP) headers set
- [ ] HSTS enabled with long max-age
- [ ] Audit logging enabled and tested
- [ ] Backup and disaster recovery tested
- [ ] Penetration testing completed
- [ ] Vulnerability scanning completed
- [ ] HIPAA risk assessment documented
- [ ] GDPR compliance checklist completed
- [ ] Privacy policy and terms of service reviewed by legal
- [ ] Incident response plan documented
- [ ] Security training completed for all team members

---

**This implementation guide provides the technical foundation for a secure, compliant mental health platform. Regular security audits and updates are essential to maintain protection against evolving threats.**
