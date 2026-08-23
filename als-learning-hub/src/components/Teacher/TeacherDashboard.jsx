function TeacherDashboard({ onNavigate }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-bg py-10">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">

        {/* Header */}
        <div className="p-8 shadow rounded-2xl bg-surface">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
            Teacher Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            Teacher Dashboard
          </h1>

          <p className="max-w-2xl mt-3 text-ink-soft">
            Manage your ALS learning materials, modules, quizzes, and learners
            from one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Subjects */}
          <button
            type="button"
            className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-blue">
              📚
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              Subjects
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Manage your learning subjects.
            </p>
          </button>

          {/* Modules */}
          <button
            type="button"
            className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-green">
              📖
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              Modules
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Add and manage learning modules and PDFs.
            </p>
          </button>

          {/* Quizzes */}
          <button
            type="button"
            className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-red">
              📝
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              Quizzes
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Create quizzes or upload quiz PDFs.
            </p>
          </button>

          {/* Learners */}
          <button
            type="button"
            className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-highlight-soft">
              👨‍🎓
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              Learners
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              View and monitor your ALS learners.
            </p>
          </button>

        </div>

        {/* Quick Actions */}
        <section className="p-8 mt-10 shadow rounded-2xl bg-surface">
          <h2 className="text-xl font-bold text-ink">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-3 mt-5">

            <button
              type="button"
              className="px-5 py-3 text-sm font-semibold text-white transition rounded-lg bg-primary hover:bg-primary-hover"
            >
              + Add Module
            </button>

            <button
              type="button"
              className="px-5 py-3 text-sm font-semibold text-white transition rounded-lg bg-secondary hover:bg-secondary-hover"
            >
              + Create Quiz
            </button>

            <button
              type="button"
              className="px-5 py-3 text-sm font-semibold transition border rounded-lg border-border bg-surface text-ink hover:bg-bg-alt"
            >
              View Learners
            </button>

          </div>
        </section>

      </div>
    </main>
  )
}

export default TeacherDashboard