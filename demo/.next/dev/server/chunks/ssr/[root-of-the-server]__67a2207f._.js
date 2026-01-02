module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/demo/app/chat.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Chat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/demo/node_modules/.pnpm/next@16.1.1_@opentelemetry+_497e546a9fb1c4b6bb6dc7b4200cae4b/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'ai/react'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat'
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                children: messages.map((m, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            m.role === 'user' ? 'User: ' : 'AI: ',
                            m.content
                        ]
                    }, index, true, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 14,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/demo/app/chat.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            "Say something...",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: input,
                                onChange: handleInputChange
                            }, void 0, false, {
                                fileName: "[project]/demo/app/chat.tsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        children: "Send"
                    }, void 0, false, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/demo/app/chat.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/demo/app/chat.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/demo/node_modules/.pnpm/next@16.1.1_@opentelemetry+_497e546a9fb1c4b6bb6dc7b4200cae4b/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/demo/node_modules/.pnpm/next@16.1.1_@opentelemetry+_497e546a9fb1c4b6bb6dc7b4200cae4b/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/demo/node_modules/.pnpm/next@16.1.1_@opentelemetry+_497e546a9fb1c4b6bb6dc7b4200cae4b/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__67a2207f._.js.map