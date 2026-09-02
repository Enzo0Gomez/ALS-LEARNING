import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load env vars from .env
const envContent = readFileSync(".env", "utf8");
const envVars = {};
const lines = envContent.split(/\r?\n/);
for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
        let value = match[2] || "";
        value = value.replace(/^["']/g, "").replace(/["']$/g, "");
        envVars[match[1]] = value;
    }
}

const supabase = createClient(
    envVars.VITE_SUPABASE_URL,
    envVars.VITE_SUPABASE_PUBLISHABLE_KEY
);

// ===== ACCOUNTS TO CREATE =====
const ACCOUNTS = [{
        label: "TEACHER",
        email: "teacher.alslearninghub@gmail.com",
        password: "Teacher@12345",
        firstName: "Maria",
        lastName: "Tan",
        username: "teacher.maria",
        meta: { role: "teacher" },
    },
    {
        label: "STUDENT",
        email: "student.alslearninghub@gmail.com",
        password: "Student@12345",
        firstName: "Juan",
        lastName: "Dela Cruz",
        username: "student.juan",
        meta: { role: "student", lrn: "136100123456" },
    },
];

async function main() {
    const created = [];

    for (const acct of ACCOUNTS) {
        console.log("Creating " + acct.label + " account: " + acct.email);

        // Try signing in first (account may already exist)
        const signInResult = await supabase.auth.signInWithPassword({
            email: acct.email,
            password: acct.password,
        });

        if (!signInResult.error && signInResult.data.user) {
            console.log(
                "  Already exists, user ID: " + signInResult.data.user.id
            );
            created.push({
                ...acct,
                userId: signInResult.data.user.id,
            });
            await supabase.auth.signOut();
            continue;
        }

        const signUpResult = await supabase.auth.signUp({
            email: acct.email,
            password: acct.password,
            options: {
                data: {
                    username: acct.username,
                    ...acct.meta,
                },
            },
        });
        const data = signUpResult.data;
        const signUpError = signUpResult.error;

        if (signUpError) {
            console.error("  Sign up error:", signUpError.message);
            process.exit(1);
        }

        if (!data.user) {
            console.error("  No user returned.");
            process.exit(1);
        }

        console.log("  Auth user created: " + data.user.id);

        if (!data.session) {
            console.log(
                "  NOTE: Email confirmation required (will be fixed via SQL)."
            );
        }

        created.push({...acct, userId: data.user.id });
        await supabase.auth.signOut();
    }

    console.log("");
    console.log("=== ACCOUNT USER IDs ===");
    for (const acct of created) {
        console.log(acct.label + ": " + acct.userId + " (" + acct.email + ")");
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});