/**
 * SVG icons for HTML emails.
 * Uses clean inline SVGs (Lucide icon paths + Ruryfo CMS logo) without external dependencies or emojis.
 */

export const ruryfoLogoSvg = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="28" height="28" viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet" style="display: block;">
<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none">
<path d="M2590 6200 l0 -1080 1155 0 1155 0 0 1080 0 1080 -1155 0 -1155 0 0 -1080z"/>
<path d="M5160 6800 l0 -480 490 0 490 0 0 480 0 480 -490 0 -490 0 0 -480z"/>
<path d="M5160 5600 l0 -480 1295 0 1295 0 0 480 0 480 -1295 0 -1295 0 0 -480z"/>
<path d="M2590 4215 l0 -655 795 0 795 0 0 655 0 655 -795 0 -795 0 0 -655z"/>
<path d="M4430 3915 l0 -955 650 0 650 0 0 955 0 955 -650 0 -650 0 0 -955z"/>
<path d="M5980 4725 l0 -145 885 0 885 0 0 145 0 145 -885 0 -885 0 0 -145z"/>
<path d="M5980 4185 l0 -145 139 0 138 0 7 53 c3 28 6 94 6 145 l0 92 -145 0 -145 0 0 -145z"/>
<path d="M6510 4185 l0 -145 620 0 620 0 0 145 0 145 -620 0 -620 0 0 -145z"/>
<path d="M5980 3646 l0 -144 137 1 138 2 6 40 c4 22 7 86 8 143 l2 102 -146 0 -145 0 0 -144z"/>
<path d="M6510 3645 l0 -145 618 2 617 3 3 143 3 142 -621 0 -620 0 0 -145z"/>
<path d="M5980 3105 l0 -145 145 0 145 0 0 145 0 145 -145 0 -145 0 0 -145z"/>
<path d="M6510 3105 l0 -145 449 0 448 0 7 92 c3 50 6 115 6 145 l0 53 -455 0 -455 0 0 -145z"/>
</g>
</svg>
`.trim();

export function mailIconSvg(color = '#818cf8', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
}

export function lockIconSvg(color = '#818cf8', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
}

export function clockIconSvg(color = '#f59e0b', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}

export function shieldIconSvg(color = '#818cf8', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
}

export function copyIconSvg(color = '#94a3b8', size = 14): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
}

export function alertTriangleIconSvg(color = '#fbbf24', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
}

export function keyIconSvg(color = '#818cf8', size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`;
}
