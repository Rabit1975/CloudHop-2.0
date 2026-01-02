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
var __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f40$ai$2d$sdk$2b$react$40$3$2e$0$2e$5_react$40$19$2e$2$2e$3_zod$40$4$2e$3$2e$4$2f$node_modules$2f40$ai$2d$sdk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/demo/node_modules/.pnpm/@ai-sdk+react@3.0.5_react@19.2.3_zod@4.3.4/node_modules/@ai-sdk/react/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/demo/node_modules/.pnpm/next@16.1.1_@opentelemetry+_497e546a9fb1c4b6bb6dc7b4200cae4b/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function Chat() {
    const { messages, sendMessage, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f40$ai$2d$sdk$2b$react$40$3$2e$0$2e$5_react$40$19$2e$2$2e$3_zod$40$4$2e$3$2e$4$2f$node_modules$2f40$ai$2d$sdk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChat"])();
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const handleInputChange = (e)=>{
        setInput(e.target.value);
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({
            text: input
        });
        setInput('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                children: messages.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            m.role === 'user' ? 'User: ' : 'AI: ',
                            m.parts.map((part, i)=>{
                                if (part.type === 'text') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: part.text
                                }, i, false, {
                                    fileName: "[project]/demo/app/chat.tsx",
                                    lineNumber: 29,
                                    columnNumber: 50
                                }, this);
                                return null;
                            })
                        ]
                    }, m.id, true, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/demo/app/chat.tsx",
                lineNumber: 24,
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
                                onChange: handleInputChange,
                                disabled: status !== 'ready' && status !== 'error'
                            }, void 0, false, {
                                fileName: "[project]/demo/app/chat.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$demo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$opentelemetry$2b$_497e546a9fb1c4b6bb6dc7b4200cae4b$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: status !== 'ready' && status !== 'error',
                        children: "Send"
                    }, void 0, false, {
                        fileName: "[project]/demo/app/chat.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/demo/app/chat.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/demo/app/chat.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c9b59d07._.js.map