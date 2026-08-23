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

const ACCOUNTS = [{
        label: "ADMIN",
        email: "alslearninghub.admin@gmail.com",
        password: "Admin@12345",
        expectedRole: "admin",
    },
    {
        label: "TEACHER",
        email: "teacher.alslearninghub@gmail.com",
        password: "Teacher@12345",
        expectedRole: "teacher",
    },
    {
        label: "STUDENT",
        email: "student.alslearninghub@gmail.com",
        password: "Student@12345",
        expectedRole: "student",
    },
];

async function main() {
    let allPassed = true;

    for (const acct of ACCOUNTS) {
        console.log("Testing " + acct.label + ": " + acct.email);

        const authResult = await supabase.auth.signInWithPassword({
            email: acct.email,
            password: acct.password,
        });

        if (authResult.error) {
            console.error("  LOGIN FAILED: " + authResult.error.message);
            allPassed = false;
            continue;
        }

        const userId = authResult.data.user.id;
        console.log("  Login OK (user: " + userId + ")");

        const profileResult = await supabase
            .from("profiles")
            .select("id, first_name, last_name, role")
            .eq("id", userId)
            .single();

        if (profileResult.error || !profileResult.data) {
            let msg = profileResult.error ?
                profileResult.error.message :
                "profile not found";
            console.error("  PROFILE FAILED: " + msg);
            allPassed = false;
            await supabase.auth.signOut();
            continue;
        }

        const profile = profileResult.data;
        const roleOk = profile.role === acct.expectedRole;
        console.log(
            "  Profile: " +
            profile.first_name +
            " " +
            profile.last_name +
            " | role=" +
            profile.role +
            (roleOk ? " (expected)" : " MISMATCH!")
        );
        if (!roleOk) allPassed = false;

        // Extra checks per role
        if (acct.expectedRole === "student") {
            const studentResult = await supabase
                .from("students")
                .select("education_level, learner_id")
                .eq("id", userId)
                .single();
            if (studentResult.error || !studentResult.data) {
                let msg = studentResult.error ?
                    studentResult.error.message :
                    "row not found";
                console.error("  STUDENTS ROW FAILED: " + msg);
                allPassed = false;
            } else {
                console.log(
                    "  Students row: education_level=" +
                    studentResult.data.education_level +
                    " | learner_id=" +
                    studentResult.data.learner_id
                );
            }
        }

        if (acct.expectedRole === "teacher") {
            const teacherResult = await supabase
                .from("teachers")
                .select("position")
                .eq("id", userId)
                .single();
            if (teacherResult.error || !teacherResult.data) {
                let msg = teacherResult.error ?
                    teacherResult.error.message :
                    "row not found";
                console.error("  TEACHERS ROW FAILED: " + msg);
                allPassed = false;
            } else {
                console.log(
                    "  Teachers row: position=" +
                    teacherResult.data.position
                );
            }
        }

        await supabase.auth.signOut();
        console.log("");
    }

    if (allPassed) {
        console.log("========================================");
        console.log("ALL 3 ACCOUNTS VERIFIED SUCCESSFULLY!");
        console.log("========================================");
    } else {
        console.error("SOME CHECKS FAILED - see output above.");
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});