# Logout Function Fix

## Problem

The logout resolver was throwing an error: `ReferenceError: req is not defined`.

## Root Cause

In the logout resolver, the code was trying to access `req` and `res` directly, but in GraphQL resolvers, these are available through the `context` parameter.

## Original Code (Broken)

```javascript
logout:async(_,__,context)=>{
    try
    {
        await context.logout();
        req.session.destroy((err)=>{  // ❌ req is not defined
            if(err) throw err;
        });
        res.clearCookie("connect.sid");  // ❌ res is not defined
        return {message:"Logout successfully"};
    }
    catch(error)
    {
        console.log("Error occured while logout",error);
        throw new Error(error.message || "Internal Server Errod");
    }
},
```

## Fixed Code

```javascript
logout:async(_,__,context)=>{
    try
    {
        await context.logout();
        context.req.session.destroy((err)=>{  // ✅ Access through context
            if(err) throw err;
        });
        context.res.clearCookie("connect.sid");  // ✅ Access through context
        return {message:"Logout successfully"};
    }
    catch(error)
    {
        console.log("Error occured while logout",error);
        throw new Error(error.message || "Internal Server Errod");
    }
},
```

## Frontend Logout Enhancement

Also updated the frontend Header component to properly handle logout:

### Before

```typescript
const handleLogout = async () => {
  try {
    await logout();
    refetch(); // Only refetched auth user
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

### After

```typescript
const [logout, { loading }] = useMutation(LOGOUT, {
  refetchQueries: [{ query: GET_AUTH_USER }],
  awaitRefetchQueries: true,
  onCompleted: () => {
    // Clear Apollo Client cache to remove all cached data
    apolloClient.clearStore();
    // Navigate to login page
    navigate("/login");
  },
});

const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Logout error:", error);
    // Even if logout fails on server, clear client cache and redirect
    apolloClient.clearStore();
    navigate("/login");
  }
};
```

## Improvements Made

1. **Server-side**: Fixed `req` and `res` access through `context` parameter
2. **Client-side**: Enhanced logout to:
   - Clear Apollo Client cache completely
   - Navigate to login page after logout
   - Handle errors gracefully with fallback cleanup
   - Use proper mutation configuration with refetch and completion callbacks

## Files Modified

- `/server/resolvers/user.resolver.js` - Fixed context access
- `/client/src/components/layout/Header.tsx` - Enhanced logout flow

## Testing

1. Login to the application
2. Click the logout button in the header
3. Should successfully logout and redirect to login page
4. Verify session is cleared and user cannot access protected routes

The logout functionality now works correctly without any reference errors and provides a complete logout experience.
