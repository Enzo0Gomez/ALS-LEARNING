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
        className="flex items-center justify-between px-6 mx-auto min-h-20 max-w-7xl lg:px-8"
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2"
          aria-label="ALS Learning Hub home"
        >
          <img
            src={alsLogo}
            alt="ALS Learning Hub"
            className="object-contain w-20 h-20"
          />

          <h1 className="text-xl font-bold text-primary">
            Learning Materials
          </h1>
        </button>

        <div className="flex items-center gap-3 sm:gap-6">

          {/* Navigation */}
          <div className="items-center hidden gap-6 text-sm font-medium text-ink sm:flex">
            {navigationItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                aria-current={
                  activePage === item.page ? 'page' : undefined
                }
                className={`transition-colors hover:text-primary ${
                  activePage === item.page
                    ? 'font-bold text-primary'
                    : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Login */}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              activePage === 'login'
                ? 'bg-tint-blue text-primary'
                : 'text-primary hover:bg-tint-blue'
            }`}
          >
            Log in
          </button>

          {/* Sign Up */}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
              activePage === 'signup'
                ? 'bg-primary-hover'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            Sign up
          </button>

        </div>
      </nav>
    </header>
  )
}

export default Navbar