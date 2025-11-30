# How to Get JWT Token for Swagger Testing

This guide shows you how to authenticate in Swagger UI by getting a JWT token from the frontend.

---

## Method 1: Get Token from Frontend (Recommended)

### Step 1: Start Both Frontend and Backend

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 2: Log In via Frontend

1. Open your browser to: `http://localhost:3002`
2. Click **Login with Google**
3. Complete the Google OAuth flow
4. You'll be redirected back to the app (now authenticated)

### Step 3: Extract JWT Token from Browser

**Option A: Using Chrome DevTools**

1. Press `F12` to open DevTools (or Right-click → Inspect)
2. Click on the **Application** tab (top menu)
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:3002`
5. Look for a key named `token` or `jwt` or similar
6. Click on the value to select it
7. Copy the entire token (it's a long string like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Visual Guide for Chrome:**
```
DevTools → Application Tab
└── Storage
    └── Local Storage
        └── http://localhost:3002
            └── token: "eyJhbGciOiJI..." ← Copy this value
```

**Option B: Using Firefox DevTools**

1. Press `F12` to open DevTools
2. Click on the **Storage** tab
3. Expand **Local Storage** in the sidebar
4. Click on `http://localhost:3002`
5. Find the `token` key
6. Copy the value

**Option C: Using Console (Any Browser)**

1. Press `F12` to open DevTools
2. Click on the **Console** tab
3. Type this command:
   ```javascript
   localStorage.getItem('token')
   ```
4. Press Enter
5. Copy the output (without the quotes)

**Option D: Check URL Parameters (If Using URL-Based Auth)**

If your frontend receives the token in the URL:
1. After Google OAuth redirect, check the URL bar
2. Look for `?token=eyJhbGciOiJ...`
3. Copy everything after `token=`

### Step 4: Use Token in Swagger

1. Open Swagger UI: `http://localhost:3000/api`
2. Click the **Authorize** button (green button with a lock icon, top right)
3. A popup will appear titled "Available authorizations"
4. In the **Value** field, paste your token
5. Click **Authorize**
6. Click **Close**

Now all protected endpoints will automatically include your JWT token!

### Step 5: Test an Authenticated Endpoint

1. Click on `GET /organizations` (or any protected endpoint)
2. Click **Try it out**
3. Click **Execute**
4. You should see a 200 response with your data!

If you get a 401 Unauthorized, your token might be expired or invalid.

---

## Method 2: Get Token Directly from Backend (For Testing)

If you don't want to go through the frontend, you can get a token directly from the auth endpoint.

### Using cURL

```bash
# This requires completing Google OAuth manually
# 1. Get the callback URL from the backend response
# 2. Extract the token from the redirect URL

# Easier way: Use the frontend method above!
```

### Using Postman/Insomnia

1. Create a GET request to: `http://localhost:3000/auth/google`
2. This will redirect you to Google login
3. Complete the OAuth flow
4. Postman will capture the callback with the token
5. Copy the token from the callback URL

---

## Method 3: Manual Token Creation (For Development Only)

If you need a token without going through OAuth (for testing):

### Step 1: Find Your User ID in Database

```bash
# Connect to your database
psql -U postgres -d devlead-db

# Find your user
SELECT id, email FROM users WHERE email = 'your-email@gmail.com';
```

### Step 2: Use the Backend Script

Create a temporary script `backend/src/scripts/generate-token.ts`:

```typescript
import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET || 'your-secret-key',
});

const payload = {
  email: 'your-email@gmail.com',
  sub: 'your-user-id-from-database',
};

const token = jwtService.sign(payload);
console.log('JWT Token:', token);
```

Run it:
```bash
cd backend
ts-node src/scripts/generate-token.ts
```

**⚠️ Warning:** This method bypasses authentication and should ONLY be used in local development!

---

## Troubleshooting

### "I don't see a token in localStorage"

**Check:**
1. Did you successfully log in? (Check if you see your user info in the UI)
2. Is the frontend correctly storing the token?
   - Look in `frontend/src/context/AuthContext.tsx`
   - It should be calling `localStorage.setItem('token', ...)`

**How to check if frontend is receiving the token:**
1. Open DevTools Console
2. After logging in, type:
   ```javascript
   console.log(localStorage.getItem('token'))
   ```
3. If it shows `null`, the frontend isn't storing the token

**Fix:** Check `AuthContext.tsx` - the token should be extracted from the URL parameter and saved to localStorage.

### "Token is expired"

JWT tokens expire! Default is usually 1 hour or 1 day.

**Solution:**
1. Log out of the frontend
2. Log in again to get a fresh token
3. Copy the new token to Swagger

### "401 Unauthorized even with token"

**Check:**
1. Did you prefix the token with `Bearer ` in Swagger?
   - ✅ Correct: Just paste the token (Swagger adds "Bearer" automatically)
   - ❌ Wrong: Don't manually add "Bearer" in Swagger's authorize dialog
   
2. Is the JWT_SECRET the same in backend?
   - Check `backend/.env` or `backend/src/auth/auth.module.ts`

3. Is the token format correct?
   - Should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3...`
   - Three parts separated by dots

### "Authorize button is grayed out"

**Check:**
1. Did you add `@ApiBearerAuth('JWT-auth')` to the endpoint?
2. Is the endpoint definition correct in the controller?

---

## Quick Reference

### Where to Find Things

| What | Where |
|------|-------|
| Frontend login | `http://localhost:3002` |
| Swagger UI | `http://localhost:3000/api` |
| Token in browser | DevTools → Application → Local Storage |
| Token in console | `localStorage.getItem('token')` |

### Token Looks Like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbm8ubmV0QGdtYWlsLmNvbSIsInN1YiI6IjdiMWY2NDA3LTQ4MjktNGIxNy04N2RiLWQwNjdkY2ViMGJlMCIsImlhdCI6MTYzMjg1MDAwMCwiZXhwIjoxNjMyOTM2NDAwfQ.signature-here
```

Parts:
- Header: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- Payload: `eyJlbWFpbCI6Im1hbm8ubmV0QGdtYWlsLmNvbSIsInN1YiI6IjdiMWY2NDA3...`
- Signature: `signature-here`

---

## Video Tutorial Alternative

If you prefer a visual walkthrough, I can create a screen recording showing:
1. Logging into the frontend
2. Opening DevTools
3. Copying the token from localStorage
4. Pasting into Swagger
5. Testing an authenticated endpoint

Let me know if you'd like me to create this!
