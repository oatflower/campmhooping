import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trees, Facebook, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-bark text-sand-light mt-20">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center">
                <Trees className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">CampThai</span>
            </Link>
            <p className="text-sand/80 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.home')}</Link></li>
              <li><Link to="/camps" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.searchCamps')}</Link></li>
              <li><Link to="/gear" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.gear')}</Link></li>
              <li><Link to="/about" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.about')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.faq')}</Link></li>
              <li><Link to="/terms" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.privacy')}</Link></li>
              <li><Link to="/contact" className="text-sand/80 hover:text-sand transition-colors text-sm">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sand/80 text-sm">
                <Phone className="w-4 h-4" />
                <span>02-xxx-xxxx</span>
              </li>
              <li className="flex items-center gap-2 text-sand/80 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@campthai.com</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-sand/10 flex items-center justify-center hover:bg-sand/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-sand/10 flex items-center justify-center hover:bg-sand/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-sand/20 mt-10 pt-8 text-center text-sand/60 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
