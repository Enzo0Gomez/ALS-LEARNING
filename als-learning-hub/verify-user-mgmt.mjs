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

async function main() {
    // Login as admin
    const authResult = await supabase.auth.signInWithPassword({
        email: "alslearninghub.admin@gmail.com",
        password: "Admin@12345",
    });

    if (authResult.error) {
        console.error("LOGIN FAILED:", authResult.error.message);
        process.exit(1);
    }

    console.log("Logged in as admin.\n");

    // Find the student user
    const profilesResult = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, is_active")
        .eq("role", "student")
        .limit(1);

    const studentList = profilesResult.data || [];
    if (profilesResult.error || studentList.length === 0) {
        let msg = "none found";
        if (profilesResult.error) msg = profilesResult.error.message;
        console.error("Could not find a student profile:", msg);
        process.exit(1);
    }

    const student = profilesResult.data[0];
    console.log(
        `Test subject: ${student.first_name} ${student.last_name} (is_active=${student.is_active})`
    );

    // TEST 1: Deactivate
    const deactResult = await supabase.rpc("admin_set_user_active", {
        target_user_id: student.id,
        is_active: false,
    });
    console.log(
        "Deactivate RPC:",
        deactResult.error ? "FAILED: " + deactResult.error.message : "OK"
    );

    // TEST 2: Reactivate (restore)
    const actResult = await supabase.rpc("admin_set_user_active", {
        target_user_id: student.id,
        is_active: true,
    });
    console.log(
        "Activate RPC:",
        actResult.error ? "FAILED: " + actResult.error.message : "OK"
    );

    // TEST 3: Password reset to the SAME password (no state change)
    const pwResult = await supabase.rpc("admin_set_user_password", {
        target_user_id: student.id,
        new_password: "Student@12345",
    });
    console.log(
        "Password reset RPC:",
        pwResult.error ? "FAILED: " + pwResult.error.message : "OK"
    );

    // TEST 4: Confirm profile still shows active + login still works
    const checkResult = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", student.id)
        .single();
    console.log(
        "Profile is_active after tests:",
        checkResult.data && checkResult.data.is_active
    );

    const loginTest = await supabase.auth.signInWithPassword({
        email: "student.alslearninghub@gmail.com",
        password: "Student@12345",
    });
    console.log(
        "Student login after password reset:",
        loginTest.error ? "FAILED: " + loginTest.error.message : "OK"
    );
    await supabase.auth.signOut();

    const allOk = !deactResult.error &&
        !actResult.error &&
        !pwResult.error &&
        !loginTest.error;

    console.log(
        allOk ?
        "\nALL USER MANAGEMENT FEATURES WORK!" :
        "\nSOME TESTS FAILED - see above."
    );
    process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});