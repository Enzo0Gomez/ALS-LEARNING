import alsLogo from '../assets/picture/logo_als.jpg'

function Homepage({ onNavigate, settings, announcements = [] }) {
    const titleLines = (settings?.hero_title || "Learn.\nGrow.\nAchieve.").split("\n");

    return (
        <section id="home" className="landing-page min-h-[calc(100vh-80px)] bg-white">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-12 lg:px-8">

                {/* Left Side */}
                <div className="landing-copy w-full lg:w-1/2">
                    <h1 className="landing-title text-5xl font-bold leading-tight text-primary md:text-6xl">
                        {titleLines.map((line, index) => (
                            <span key={`${line}-${index}`} className="block">{line}</span>
                        ))}
                    </h1>

                    <p className="landing-description mt-6 max-w-xl text-lg leading-8 text-[#484848]">
                        {settings?.hero_description}
                    </p>

                    <div className="landing-actions mt-8 flex flex-wrap gap-4">
                        <button type="button" onClick={() => onNavigate('login')} className="landing-button rounded-xl bg-[#141EB4] px-6 py-3 font-semibold text-white transition hover:opacity-90">
                            {settings?.primary_button_text}
                        </button>

                        <button type="button" onClick={() => onNavigate('about')} className="landing-button rounded-xl border-2 border-[#141EB4] px-6 py-3 font-semibold text-primary transition hover:bg-[#141EB4] hover:text-white">
                            {settings?.secondary_button_text}
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="landing-art hidden lg:flex w-1/2 items-center justify-center">
                    <div className="p-8 flex flex-col items-center justify-center">
                        <img
                            src={alsLogo}
                            alt="ALS Logo"
                            className="landing-logo w-120 h-120 object-contain"
                        />
                    </div>
                </div>

            </div>

            {announcements.length > 0 && (
                <section className="landing-announcements mx-auto max-w-7xl border-t border-border px-6 py-10 lg:px-8" aria-labelledby="announcements-heading">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Updates</p>
                    <h2 id="announcements-heading" className="mt-2 text-3xl font-bold text-primary">Announcements</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {announcements.map((item) => (
                            <article key={item.id} className="rounded-2xl border border-border bg-bg p-5">
                                {item.image_url && <img src={item.image_url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" />}
                                <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                                <p className="mt-2 leading-7 text-ink-soft">{item.description}</p>
                                {item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">View attached PDF</a>}
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </section>
    )
}

export default Homepage
