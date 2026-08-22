import { useState } from "react";

function Login({ onSignUp }) {
  const [loginType, setLoginType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      loginType,
      username,
      password,
    });

    // Supabase authentication will be connected here later.
  };

  return (
    <main id="login" className="min-h-screen bg-bg">
      <div className="flex min-h-screen">

        {/* Left Side */}
        <div  className="flex-col justify-between hidden w-1/2 p-12 text-white bg-primary lg:flex">
          

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              Welcome back
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Continue your learning journey.
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/75">
              Access your learning materials, modules, quizzes, and
              track your progress through the ALS Learning Hub.
            </p>
          </div>

          <p className="text-sm text-white/50">
            © 2026 ALS Learning Hub
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center w-full px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-md">

            {/* Logo / Header */}
            <div className="mb-8 text-center lg:text-left">
              <p className="text-2xl font-bold text-primary lg:hidden">
                ALS Learning Hub
              </p>

              <h2 className="mt-6 text-3xl font-bold text-ink">
                Welcome back
              </h2>

              <p className="mt-2 text-ink-soft">
                Sign in to continue to your account.
              </p>
            </div>

            {/* Account Type */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-ink">
                Login as
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginType("student")}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    loginType === "student"
                      ? "border-primary bg-tint-blue text-primary"
                      : "border-border bg-surface text-ink-soft hover:bg-bg"
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType("teacher")}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    loginType === "teacher"
                      ? "border-primary bg-tint-blue text-primary"
                      : "border-border bg-surface text-ink-soft hover:bg-bg"
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-semibold text-ink"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-ink"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-highlight hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:bg-primary-hover"
              >
                Login
              </button>
            </form>

            {/* Signup */}
            <div className="mt-8 text-sm text-center text-ink-soft">
              Don't have a student account yet?{" "}
              <button
                type="button"
                onClick={onSignUp}
                className="font-semibold text-primary hover:underline"
              >
                Sign up
              </button>
            </div>

            {/* Teacher Notice */}
            {loginType === "teacher" && (
              <div className="p-4 mt-6 border rounded-xl border-border bg-bg-alt">
                <p className="text-xs leading-5 text-ink-soft">
                  Teacher accounts are created and managed by the
                  ALS administrator. Student registration is available
                  through the Sign Up page.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;