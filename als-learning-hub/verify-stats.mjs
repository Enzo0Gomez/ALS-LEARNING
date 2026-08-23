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

    console.log("Logged in as admin. Fetching dashboard stats...\n");

    let failed = false;

    // 1. Students
    const studentsResult = await supabase
        .from("students")
        .select("id", { count: "exact", head: true });
    if (studentsResult.error) {
        console.error("STUDENTS COUNT FAILED:", studentsResult.error.message);
        failed = true;
    } else {
        console.log("Total Students:", studentsResult.count);
    }

    // 2. Teachers
    const teachersResult = await supabase
        .from("teachers")
        .select("id", { count: "exact", head: true });
    if (teachersResult.error) {
        console.error("TEACHERS COUNT FAILED:", teachersResult.error.message);
        failed = true;
    } else {
        console.log("Total Teachers:", teachersResult.count);
    }

    // 3. Quiz takers
    const attemptsResult = await supabase
        .from("quiz_attempts")
        .select("student_id");
    if (attemptsResult.error) {
        console.error(
            "QUIZ ATTEMPTS FETCH FAILED:",
            attemptsResult.error.message
        );
        failed = true;
    } else {
        const unique = new Set(
            (attemptsResult.data || []).map((r) => r.student_id)
        ).size;
        console.log("Quiz Takers (distinct):", unique);
    }

    // 4. Modules uploaded
    const modulesResult = await supabase
        .from("modules")
        .select("id", { count: "exact", head: true })
        .not("pdf_url", "is", null);
    if (modulesResult.error) {
        console.error("MODULES COUNT FAILED:", modulesResult.error.message);
        failed = true;
    } else {
        console.log("Modules Uploaded (with pdf_url):", modulesResult.count);
    }

    // 5. Total users
    const usersResult = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
    if (usersResult.error) {
        console.error("USERS COUNT FAILED:", usersResult.error.message);
        failed = true;
    } else {
        console.log("Total Users:", usersResult.count);
    }

    await supabase.auth.signOut();

    if (failed) {
        process.exit(1);
    }

    console.log("\nALL DASHBOARD STATS QUERIES WORK!");
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});