import alsLogo from '../assets/picture/logo_als.jpg'

function Navbar({ activePage, onNavigate }) {
  const navigationItems = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Teacher', page: 'teacher' },
  ]

  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
      >
        <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2" aria-label="ALS Learning Hub home">
          <img src={alsLogo} alt="" className="h-20 w-20 object-contain" />
          <h1 className="text-xl font-bold text-primary">Learning Materials</h1>
        </button>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
            {navigationItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                aria-current={activePage === item.page ? 'page' : undefined}
                className={`transition-colors hover:text-primary ${activePage === item.page ? 'font-bold text-primary' : ''}`}
              >
                {item.label}
              </button>
            ))}
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
