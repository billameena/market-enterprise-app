import { Link } from '@tanstack/react-router';

function FooterLink({ to, children }: { to?: string; children: React.ReactNode }) {
  if (to) {
    return (
      <Link to={to as '/'} className="hover:text-white transition-colors">
        {children}
      </Link>
    );
  }
  return (
    <span className="cursor-default opacity-60 select-none" title="Coming soon">
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-400 py-12 mt-auto">
      <div className="container-narrow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><FooterLink>About Us</FooterLink></li>
              <li><FooterLink>Blog</FooterLink></li>
              <li><FooterLink>Careers</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Sellers</h3>
            <ul className="space-y-2 text-sm">
              <li><FooterLink to="/vendor/dashboard">Sell With Us</FooterLink></li>
              <li><FooterLink to="/vendor/dashboard">Seller Guide</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><FooterLink>Help Center</FooterLink></li>
              <li><FooterLink>Contact Us</FooterLink></li>
              <li><FooterLink>FAQ</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><FooterLink>Privacy Policy</FooterLink></li>
              <li><FooterLink>Terms of Service</FooterLink></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Enterprise Marketplace. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <span>Secure payments</span>
            <span>Free returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
