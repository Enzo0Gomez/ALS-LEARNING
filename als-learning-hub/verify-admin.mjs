import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load env vars from .env
const envContent = readFileSync(".env", "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
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

const ADMIN_EMAIL = "alslearninghub.admin@gmail.com";
const ADMIN_PASSWORD = "Admin@12345";

async function main() {
    console.log("Verifying admin login...");

    // 1. Test login exactly like Login.jsx does
    const authResult = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (authResult.error) {
        console.error("LOGIN FAILED:", authResult.error.message);
        process.exit(1);
    }

    console.log("Login OK! User ID: " + authResult.data.user.id);

    // 2. Fetch profile exactly like Login.jsx does
    const profileResult = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .eq("id", authResult.data.user.id)
        .single();

    if (profileResult.error || !profileResult.data) {
        let msg = profileResult.error ?
            profileResult.error.message :
            "profile not found";
        console.error("PROFILE FETCH FAILED:", msg);
        process.exit(1);
    }

    const profile = profileResult.data;
    console.log("Profile found:");
    console.log("  Name: " + profile.first_name + " " + profile.last_name);
    console.log("  Role: " + profile.role);

    // 3. Check role matches what AdminDashboard expects
    if (profile.role === "admin") {
        console.log("");
        console.log("========================================");
        console.log("SUCCESS! Admin dashboard access verified.");
        console.log("========================================");
        console.log("Email:    " + ADMIN_EMAIL);
        console.log("Password: " + ADMIN_PASSWORD);
    } else {
        console.error(
            "WARNING: Role is '" +
            profile.role +
            "' not 'admin'. Run setup-admin.sql again."
        );
        process.exit(1);
    }

    await supabase.auth.signOut();
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});