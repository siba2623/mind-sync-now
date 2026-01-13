# Security Guidelines for MindSync

## 🔒 API Key Protection

This project uses several sensitive API keys that must be protected:

### ✅ What's Protected
- `.env` file (contains all API keys)
- Any files with `*secret*`, `*key*`, or `*token*` in the name
- Supabase configuration files
- Database files

### ⚠️ Important Security Rules

1. **Never commit API keys to version control**
   - The `.env` file is in `.gitignore` - keep it there!
   - Always use `.env.example` for sharing configuration templates

2. **API Key Rotation**
   - Rotate your API keys regularly
   - If you accidentally commit a key, revoke it immediately and generate a new one

3. **Environment-Specific Keys**
   - Use different API keys for development, staging, and production
   - Never use production keys in development

### 🔑 API Keys Used

- **Supabase**: Database and authentication
- **Google Gemini AI**: Chatbot functionality
- **Spotify API**: Music integration (optional)
- **OpenWeather API**: Weather-based insights (optional)

### 🚨 If You Accidentally Commit API Keys

1. **Immediately revoke the exposed keys** from their respective dashboards
2. **Generate new API keys**
3. **Update your `.env` file** with the new keys
4. **Remove the keys from git history** (if needed):
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```

### 📋 Pre-Commit Checklist

Before pushing to GitHub:
- [ ] `.env` file is not staged for commit
- [ ] No API keys are hardcoded in source files
- [ ] `.env.example` is updated (without real values)
- [ ] All sensitive files are in `.gitignore`

## 🛡️ Additional Security Measures

- Use environment variables for all sensitive configuration
- Implement proper error handling to avoid exposing internal details
- Regularly update dependencies to patch security vulnerabilities
- Use HTTPS in production
- Implement proper authentication and authorization

## 📞 Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by:
1. Not creating a public GitHub issue
2. Contacting the maintainers directly
3. Providing detailed information about the vulnerability