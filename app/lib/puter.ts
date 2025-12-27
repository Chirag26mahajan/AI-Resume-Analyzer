import { create } from "zustand";

/* ===================== GLOBAL PUTER TYPES ===================== */
declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => Promise<boolean>;
                signIn: () => Promise<void>;
                signOut: () => Promise<void>;
            };
            fs: {
                write: (path: string, data: string | File | Blob) => Promise<File>;
                read: (path: string) => Promise<Blob>;
                upload: (files: File[] | Blob[]) => Promise<FSItem>;
                delete: (path: string) => Promise<void>;
                readdir: (path: string) => Promise<FSItem[]>;
            };
            ai: {
                chat: (
                    messages: ChatMessage[],
                    options?: PuterChatOptions
                ) => Promise<AIResponse>;
                img2txt: (image: string | File | Blob) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                delete?: (key: string) => Promise<boolean>;
                del?: (key: string) => Promise<boolean>;
                list: (
                    pattern: string,
                    returnValues?: boolean
                ) => Promise<string[] | KVItem[]>;
                flush: () => Promise<boolean>;
            };
        };
    }
}

/* ===================== STORE INTERFACE ===================== */
interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;

    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
    };

    fs: {
        write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (files: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };

    ai: {
        feedback: (path: string, message: string) => Promise<AIResponse | undefined>;
        img2txt: (image: string | File | Blob) => Promise<string | undefined>;
    };

    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

/* ===================== HELPERS ===================== */
const getPuter = () =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

/* ===================== STORE ===================== */
export const usePuterStore = create<PuterStore>((set, get) => ({
    isLoading: true,
    error: null,
    puterReady: false,

    /* ---------- AUTH ---------- */
    auth: {
        user: null,
        isAuthenticated: false,

        signIn: async () => {
            const puter = getPuter();
            if (!puter) return set({ error: "Puter not available" });

            set({ isLoading: true });
            await puter.auth.signIn();
            await get().auth.checkAuthStatus();
        },

        signOut: async () => {
            const puter = getPuter();
            if (!puter) return;

            await puter.auth.signOut();
            set({
                auth: { ...get().auth, user: null, isAuthenticated: false },
                isLoading: false,
            });
        },

        checkAuthStatus: async () => {
            const puter = getPuter();
            if (!puter) return false;

            const isSignedIn = await puter.auth.isSignedIn();
            if (!isSignedIn) {
                set({
                    auth: { ...get().auth, user: null, isAuthenticated: false },
                    isLoading: false,
                });
                return false;
            }

            const user = await puter.auth.getUser();
            set({
                auth: { ...get().auth, user, isAuthenticated: true },
                isLoading: false,
            });
            return true;
        },
    },

    /* ---------- FS ---------- */
    fs: {
        write: async (path, data) => getPuter()?.fs.write(path, data),
        read: async (path) => getPuter()?.fs.read(path),
        upload: async (files) => getPuter()?.fs.upload(files),
        delete: async (path) => getPuter()?.fs.delete(path),
        readDir: async (path) => getPuter()?.fs.readdir(path),
    },

    /* ---------- AI ---------- */
    ai: {
        feedback: async (path, message) => {
            const puter = getPuter();
            if (!puter) return;

            try {
                return await puter.ai.chat(
                    [
                        {
                            role: "user",
                            content: [
                                { type: "file", puter_path: path },
                                { type: "text", text: message },
                            ],
                        },
                    ],
                    {
                        model: "gpt-4o-mini",
                        temperature: 0.2,
                    }
                );
            } catch (err) {
                console.error("AI feedback error:", err);
                set({ error: "AI analysis failed" });
                return;
            }
        },

        img2txt: async (image) => getPuter()?.ai.img2txt(image),
    },

    /* ---------- KV (FIXED) ---------- */
    kv: {
        get: async (key) => getPuter()?.kv.get(key),

        set: async (key, value) => getPuter()?.kv.set(key, value),

        delete: async (key) => {
            const puter = getPuter();
            if (!puter) return;

            // ✅ Runtime-safe deletion
            if (typeof puter.kv.delete === "function") {
                return await puter.kv.delete(key);
            }

            if (typeof (puter.kv as any).del === "function") {
                return await (puter.kv as any).del(key);
            }

            console.error("Puter KV delete method not available");
            return;
        },

        list: async (pattern, returnValues) =>
            getPuter()?.kv.list(pattern, returnValues),

        flush: async () => getPuter()?.kv.flush(),
    },

    /* ---------- INIT ---------- */
    init: () => {
        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                get().auth.checkAuthStatus();
            }
        }, 100);
    },

    clearError: () => set({ error: null }),
}));
