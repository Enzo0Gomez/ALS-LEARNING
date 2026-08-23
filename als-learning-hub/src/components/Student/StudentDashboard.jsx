function StudentDashboard({ user }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-bg py-10">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">

        {/* Header */}
        <div className="p-8 shadow rounded-2xl bg-surface">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
            Student Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            Student Dashboard
          </h1>

          <p className="max-w-2xl mt-3 text-ink-soft">
            {user
              ? `Welcome back, ${user.first_name || ""} ${user.last_name || ""}!`
              : "Welcome back!"}
          </p>
        </div>

      </div>
    </main>
  )
}

export default StudentDashboard