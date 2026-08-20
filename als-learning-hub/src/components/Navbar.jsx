import alsLogo from '../assets/picture/logo_als.jpg'

function Navbar() {
  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
      >
        <a href="#home" className="flex items-center" aria-label="ALS Learning Hub home">
          <img src={alsLogo} alt="ALS Learning Hub" className="h-12 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
            <a href="#home" className="transition-colors hover:text-primary">Home</a>
            <a href="#about" className="transition-colors hover:text-primary">About</a>
            <a href="#teacher" className="transition-colors hover:text-primary">Teacher</a>
          </div>

          <a
            href="#login"
            className="rounded-md px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-tint-blue"
          >
            Log in
          </a>
          <a
            href="#signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Sign up
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
