import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PlusCircle, Calendar, ClipboardCheck } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/candidatures', icon: Briefcase, label: 'Candidatures' },
  { to: '/ajout', icon: PlusCircle, label: 'Ajouter' },
  { to: '/calendrier', icon: Calendar, label: 'Calendrier' },
  { to: '/a-preparer', icon: ClipboardCheck, label: 'À préparer' },
];

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-green-200 px-4 py-3 md:pl-24 flex items-center gap-2 shadow-sm">
        <span className="text-2xl shrink-0">🐜</span>
        <h1 className="text-lg font-bold text-green-800">L'Emploi des Fourmis</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-20 p-4 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-200 z-50">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs transition-colors ${
                  isActive ? 'text-green-700 bg-green-100' : 'text-stone-500 hover:text-green-600'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-green-200 flex-col items-center pt-20 gap-2 z-50 shadow-sm">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
                isActive ? 'text-green-700 bg-green-100' : 'text-stone-500 hover:text-green-600 hover:bg-green-50'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;