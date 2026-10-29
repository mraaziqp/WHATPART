import { generateCssVariables, type ThemeConfig } from '@/data/theme';

export function ThemeStyle({ theme }: { theme: ThemeConfig }) {
  const css = generateCssVariables(theme);
  return <style id="whatpart-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
