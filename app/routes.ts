import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    // ✅ ROOT ROUTE (THIS IS REQUIRED)
    route("/", "routes/home.tsx"),

    route("/auth", "routes/auth.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/wipe", "routes/wipe.tsx"),

    // ✅ fallback (optional but safe)
    route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
