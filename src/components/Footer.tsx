import { Copyright } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#003366] text-white py-4 mt-8 shadow-lg">
      <div className="container mx-auto px-4">
        <p className="text-center flex items-center justify-center">
          <Copyright className="h-4 w-4 mr-2" />
          2025 - Jeux de données - Québec Données
        </p>
      </div>
    </footer>
  );
}