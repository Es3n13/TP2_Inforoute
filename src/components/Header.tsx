import { Database, LibraryBig, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
  const isAuthenticated = true; // À remplacer par votre logique d'authentification

  return (
    <header className="bg-[#003366] text-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Database className="h-6 w-6" />
            <span>Interface Portail - Données Québec</span>
          </Link>

          {/* Navigation principale */}
          <div className="flex items-center space-x-6">
            <Link to="/datasets" className="flex items-center space-x-1 hover:text-blue-200 transition">
              <LibraryBig className="h-5 w-5" />
              <span>Catalogue</span>
            </Link>
            
            <Link to="/stats" className="flex items-center space-x-1 hover:text-blue-200 transition">
              <BarChart3 className="h-5 w-5" />
              <span>Statistiques</span>
            </Link>

            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button className="flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Link to="/login" className="flex items-center w-full">
                        Connexion
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/register" className="flex items-center w-full">
                        Inscription
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
}