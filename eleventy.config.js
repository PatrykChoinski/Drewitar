import { EleventyHtmlBasePlugin } from '@11ty/eleventy';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addFilter('json', (v) => JSON.stringify(v));
  eleventyConfig.addFilter('plDate', (d) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }));
  eleventyConfig.addFilter('isoDate', (d) => new Date(d).toISOString().slice(0, 10));
}

export const config = {
  dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
  // GitHub Pages projektu: /Drewitar/. Lokalnie i przy własnej domenie: "/".
  pathPrefix: process.env.PATH_PREFIX || '/',
  templateFormats: ['njk', 'md'],
  htmlTemplateEngine: 'njk',
};
