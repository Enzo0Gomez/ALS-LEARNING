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

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== ADMIN CREDENTIALS =====
const ADMIN_EMAIL = "alslearninghub.admin@gmail.com";
const ADMIN_PASSWORD = "Admin@12345";
const FIRST_NAME = "System";
const LAST_NAME = "Administrator";

async function main() {
    console.log("Creating admin account...");
    console.log("Email: " + ADMIN_EMAIL);
    console.log("Password: " + ADMIN_PASSWORD);
    console.log("---");

    // 1. Check if the account already exists by trying to sign in
    const signInResult = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    const existingSession = signInResult.data;
    const existingError = signInResult.error;

    let userId;

    if (!existingError && existingSession && existingSession.user) {
        console.log(
            "Account already exists. Updating profile role to admin..."
        );
        userId = existingSession.user.id;
    } else {
        // 2. Create the auth user
        const signUpResult = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            options: {
                data: {
                    username: "admin",
                    role: "admin",
                },
            },
        });
        const data = signUpResult.data;
        const signUpError = signUpResult.error;

        if (signUpError) {
            console.error("Sign up error:", signUpError.message);
            process.exit(1);
        }

        if (!data.user) {
            console.error("No user returned from sign up.");
            process.exit(1);
        }

        userId = data.user.id;
        console.log("Auth user created: " + userId);

        if (!data.session) {
            console.log(
                "WARNING: No session returned - email confirmation is likely ENABLED."
            );
            console.log(
                "You must confirm the email in the Supabase dashboard before logging in."
            );
        }
    }

    // 3. Insert or update the profile row with role = admin
    const upsertResult = await supabase.from("profiles").upsert({
        id: userId,
        first_name: FIRST_NAME,
        last_name: LAST_NAME,
        role: "admin",
    });
    const upsertError = upsertResult.error;

    if (upsertError) {
        console.error("Profile upsert error:", upsertError.message);
        console.log(
            "NOTE: If this is an RLS policy issue, you may need to add the profile row manually in the Supabase dashboard."
        );
        process.exit(1);
    }

    console.log("Profile created/updated with role = admin");
    console.log("---");

    // 4. Verify login works
    const verifyResult = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    const verifyData = verifyResult.data;
    const verifyError = verifyResult.error;

    if (verifyError) {
        console.error("Verification login FAILED:", verifyError.message);
        process.exit(1);
    }

    const profileResult = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .eq("id", verifyData.user.id)
        .single();
    const profile = profileResult.data;
    const profileError = profileResult.error;

    if (profileError || !profile) {
        let msg = profileError ? profileError.message : "unknown error";
        console.error("Could not fetch profile:", msg);
        process.exit(1);
    }

    console.log("VERIFICATION SUCCESSFUL!");
    console.log("User ID: " + profile.id);
    console.log("Name: " + profile.first_name + " " + profile.last_name);
    console.log("Role: " + profile.role);
    console.log("---");
    console.log("You can now log in to the Admin Dashboard with:");
    console.log("  Email:    " + ADMIN_EMAIL);
    console.log("  Password: " + ADMIN_PASSWORD);

    await supabase.auth.signOut();
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});