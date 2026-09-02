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
    // Login first
    const authResult = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (authResult.error) {
        console.error("LOGIN FAILED:", authResult.error.message);
        process.exit(1);
    }

    const userId = authResult.data.user.id;
    console.log("Logged in as: " + userId);

    // Check 1: Select own profile WITHOUT .single()
    const ownResult = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId);
    console.log("");
    console.log("Own profile rows visible:", ownResult.data ? ownResult.data.length : "error");
    console.log("Own profile error:", ownResult.error ? ownResult.error.message : "none");
    if (ownResult.data && ownResult.data.length > 0) {
        console.log("Row data:", JSON.stringify(ownResult.data[0], null, 2));
    }

    // Check 2: Count all visible profiles
    const allResult = await supabase.from("profiles").select("id, role");
    console.log("");
    console.log("All visible profile rows:", allResult.data ? allResult.data.length : "error");
    console.log("All profiles error:", allResult.error ? allResult.error.message : "none");
    if (allResult.data && allResult.data.length > 0) {
        for (const row of allResult.data) {
            console.log("  - " + row.id + " : " + row.role);
        }
    }

    // Check 3: admins table
    const adminsResult = await supabase
        .from("admins")
        .select("*")
        .eq("id", userId);
    console.log("");
    console.log("Admins table rows:", adminsResult.data ? adminsResult.data.length : "error");
    console.log("Admins error:", adminsResult.error ? adminsResult.error.message : "none");

    await supabase.auth.signOut();
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});