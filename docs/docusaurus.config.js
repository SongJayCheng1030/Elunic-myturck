const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const knownApiDocs = require('./known-api-docs');

const config = {
  title: 'Shopfloor.io Docs',
  tagline: 'Central home of Shopfloor.io documentation resources',
  url: 'https://tld.com/',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'elunic',
  projectName: 'shopfloor.io-docs',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          breadcrumbs: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    ({
      navbar: {
        title: 'Shopfloor.io Docs',
        logo: {
          alt: 'Shopfloor.io',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'dropdown',
            label: 'API Docs',
            position: 'left',
            items: knownApiDocs.map(d => ({
              label: d.name,
              href: `/docs/api-docs?api=${d.tag}`,
            }))
          }
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} elunic AG - All Rights Reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
