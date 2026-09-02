const learningLevels = [
  {
    title: 'Elementary',
    description:
      'Learners who have not finished elementary schooling may enter the program. They take a Functional Literacy Test (FLT) so the learning facilitator can identify their literacy level and recommend suitable modules.',
    details:
      'The learner and facilitator then create an Individual Learning Agreement (ILA) to guide and track progress and developed competencies.',
  },
  {
    title: 'High School',
    description:
      'After completing the elementary level, learners may proceed to the secondary level. Learners who completed elementary in the formal system may be admitted directly to the appropriate secondary year level.',
    details:
      'Learners who pass the Accreditation and Equivalency (A&E) assessment may continue to senior high school and pursue further education.',
  },
]

function Aboutpage({ settings }) {
  return (
    <main id="about" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">About ALS</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            {settings?.about_title || 'Alternative Learning System'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-ink-soft">
            {settings?.about_description || 'The Alternative Learning System (ALS) is a parallel learning system of the Department of Education that provides a practical option for Filipinos who cannot access formal schooling.'} Learning sessions follow a schedule agreed upon by learners and their learning facilitators.
          </p>
        </div>

        <section className="mt-14 grid gap-6 md:grid-cols-2" aria-labelledby="program-heading">
          <div className="rounded-2xl bg-surface p-8 shadow">
            <h2 id="program-heading" className="text-2xl font-bold text-primary">How the program works</h2>
            <p className="mt-4 leading-7 text-ink-soft">
              ALS is offered through school-based and community-based programs. Sessions
              may take place on school campuses, in community halls, or in other agreed
              private locations.
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-8 shadow">
            <h2 className="text-2xl font-bold text-secondary">What learners study</h2>
            <p className="mt-4 leading-7 text-ink-soft">
              Learners use uniform modules covering science, mathematics, English,
              Filipino, social studies, current events, and more. Instruction is
              delivered by government-paid teachers or private non-government
              organizations.
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="levels-heading">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Learning levels</p>
            <h2 id="levels-heading" className="mt-3 text-3xl font-bold text-ink">A clear path forward</h2>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {learningLevels.map((level) => (
              <article key={level.title} className="rounded-2xl border border-border bg-surface p-8">
                <h3 className="text-2xl font-bold text-primary">{level.title}</h3>
                <p className="mt-4 leading-7 text-ink-soft">{level.description}</p>
                <p className="mt-4 leading-7 text-ink">{level.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-primary px-8 py-12 text-white sm:px-12" aria-labelledby="vision-heading">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">DepEd</p>
              <h2 id="vision-heading" className="mt-3 text-3xl font-bold">Vision</h2>
              <p className="mt-5 leading-8 text-white/90">
                We dream of Filipinos who passionately love their country and whose
                values and competencies enable them to realize their full potential and
                contribute meaningfully to building the nation.
              </p>
              <p className="mt-4 leading-8 text-white/90">
                As a learner-centered public institution, the Department of Education
                continuously improves itself to better serve its stakeholders.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Mission</h2>
              <p className="mt-5 leading-8 text-white/90">
                To protect and promote every Filipino's right to quality, equitable,
                culture-based, and complete basic education in a child-friendly,
                gender-sensitive, safe, and motivating environment.
              </p>
              <ul className="mt-5 space-y-3 leading-7 text-white/90">
                <li>Teachers facilitate learning and nurture every learner.</li>
                <li>Administrators and staff provide an enabling, supportive environment.</li>
                <li>Families, communities, and stakeholders share responsibility for lifelong learning.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Aboutpage
