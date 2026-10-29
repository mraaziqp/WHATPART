import { requireAdminPage } from '@/lib/guards';
import { getThemeConfig } from '@/lib/theme';
import { AppearanceForm } from './AppearanceForm';

export const metadata = {
  title: 'Appearance & Looks | Admin',
};

export default async function AdminAppearancePage() {
  await requireAdminPage();
  const theme = await getThemeConfig();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇿🇦</span>
          <h2 className="text-xl font-bold text-slate-900">Storefront Appearance & Looks</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Customize the unique South African color scheme, page background, card styling, and brand accents.
          Changes take effect immediately across all storefront pages.
        </p>
      </div>

      <AppearanceForm initialTheme={theme} />
    </div>
  );
}
