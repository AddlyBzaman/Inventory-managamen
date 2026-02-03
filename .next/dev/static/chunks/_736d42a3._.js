(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/services/authService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Client-side auth service for Next.js app directory
// Uses API routes instead of direct database access
__turbopack_context__.s([
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
class AuthService {
    API_BASE = ("TURBOPACK compile-time value", "http://localhost:3000/api") || '';
    async login(username, password) {
        try {
            const response = await fetch(`${this.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                }),
                cache: 'no-store'
            });
            const data = await response.json();
            if (!data.success) {
                return null;
            }
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }
    async logout() {
        try {
            await fetch(`${this.API_BASE}/auth/logout`, {
                method: 'POST',
                cache: 'no-store'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    async getCurrentUser() {
        try {
            const response = await fetch(`${this.API_BASE}/auth/me`, {
                cache: 'no-store'
            });
            const data = await response.json();
            if (!data.success) {
                return null;
            }
            return data.user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }
    async refreshToken() {
        // Token refresh is handled by session cookies in API routes
        return true;
    }
    async createUser(userData) {
        // This would need a separate API route for user creation
        // For now, return null as it's not implemented
        console.warn('Create user functionality needs API route implementation');
        return null;
    }
}
const authService = new AuthService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/authService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 25 * 60 * 1000; // 25 minutes
function AuthProvider({ children }) {
    _s();
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sessionTimer, setSessionTimer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [warningTimer, setWarningTimer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Clear session timers
    const clearTimers = ()=>{
        if (sessionTimer) clearTimeout(sessionTimer);
        if (warningTimer) clearTimeout(warningTimer);
        setSessionTimer(null);
        setWarningTimer(null);
    };
    // Set session timers
    const setSessionTimers = ()=>{
        clearTimers();
        // Warning timer (5 minutes before timeout)
        const warning = setTimeout(()=>{
            console.warn('Session will expire in 5 minutes');
        // You could show a toast notification here
        }, WARNING_TIMEOUT);
        // Session timeout
        const timeout = setTimeout(async ()=>{
            await logout();
        }, SESSION_TIMEOUT);
        setWarningTimer(warning);
        setSessionTimer(timeout);
    };
    // Check for existing session on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkAuth = {
                "AuthProvider.useEffect.checkAuth": async ()=>{
                    try {
                        const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].getCurrentUser();
                        if (currentUser) {
                            setIsAuthenticated(true);
                            setUser(currentUser);
                            setSessionTimers();
                        }
                    } catch (error) {
                        console.error('Auth check error:', error);
                        // Clear invalid session
                        await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout();
                    } finally{
                        setIsLoading(false);
                    }
                }
            }["AuthProvider.useEffect.checkAuth"];
            checkAuth();
            // Cleanup on unmount
            return ({
                "AuthProvider.useEffect": ()=>clearTimers()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const login = async (username, password)=>{
        try {
            setIsLoading(true);
            const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].login(username, password);
            if (userData) {
                setIsAuthenticated(true);
                setUser(userData);
                setSessionTimers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally{
            setIsLoading(false);
        }
    };
    const logout = async ()=>{
        try {
            setIsLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally{
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            clearTimers();
        }
    };
    const refreshToken = async ()=>{
        try {
            const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setSessionTimers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            await logout();
            return false;
        }
    };
    // Extend session on user activity
    const extendSession = ()=>{
        if (isAuthenticated) {
            setSessionTimers();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            isAuthenticated,
            user,
            login,
            logout,
            isLoading,
            refreshToken,
            extendSession
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "EOdeehiKUaDONVq/fuwhkEh48XE=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/AuthProviderWrapper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProviderWrapper",
    ()=>AuthProviderWrapper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
'use client';
;
;
function AuthProviderWrapper({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/components/AuthProviderWrapper.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = AuthProviderWrapper;
var _c;
__turbopack_context__.k.register(_c, "AuthProviderWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_736d42a3._.js.map