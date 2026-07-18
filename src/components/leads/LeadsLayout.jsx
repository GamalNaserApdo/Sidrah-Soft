/**
 * Leads Layout — minimal private dashboard shell.
 */

import { useCMSLang } from '../../contexts/CMSLanguageContext';
import LeadsHeader from './LeadsHeader';

export default function LeadsLayout({ children }) {
  const { dir } = useCMSLang();

  return (
    <div className="leads-layout" dir={dir}>
      <LeadsHeader />
      <main className="leads-layout__main">{children}</main>
    </div>
  );
}
