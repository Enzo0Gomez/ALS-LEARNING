import alsLogo from '../assets/picture/logo_als.jpg'

function Homepage({ onNavigate }) {
    return (
        <section id="home" className="min-h-[calc(100vh-80px)] bg-white">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-12 lg:px-8">

                {/* Left Side */}
                <div className="w-full lg:w-1/2">
                    <h1 className="text-5xl font-bold leading-tight text-primary md:text-6xl">
                        Learn.
                        <br />
                        Grow.
                        <br />
                        Achieve.
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-[#484848]">
                        Accessible learning materials designed to support every ALS learner
                        on their journey toward achieving their goals.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <button className="rounded-xl bg-[#141EB4] px-6 py-3 font-semibold text-white transition hover:opacity-90">
                            Explore Learning Materials
                        </button>

                        <button type="button" onClick={() => onNavigate('about')} className="rounded-xl border-2 border-[#141EB4] px-6 py-3 font-semibold text-primary transition hover:bg-[#141EB4] hover:text-white">
                            Learn About ALS
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="hidden lg:flex w-1/2 items-center justify-center">
                    <div className=" p-8 flex flex-col items-center justify-center">
                        <img
                            src={alsLogo}
                            alt="ALS Logo"
                            className="w-120 h-120 object-contain"
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default Homepage
