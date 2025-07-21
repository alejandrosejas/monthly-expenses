"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateColorFromString = generateColorFromString;
exports.generateDistinctColors = generateDistinctColors;
exports.getContrastColor = getContrastColor;
/**
 * Generate a color based on a string (for consistent category colors)
 * @param str The string to generate a color from
 * @returns A hex color code
 */
function generateColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}
/**
 * Generate a set of distinct colors
 * @param count The number of colors to generate
 * @returns An array of hex color codes
 */
function generateDistinctColors(count) {
    const colors = [];
    const goldenRatioConjugate = 0.618033988749895;
    let h = Math.random();
    for (let i = 0; i < count; i++) {
        h += goldenRatioConjugate;
        h %= 1;
        const hue = Math.floor(h * 360);
        const saturation = 65 + Math.random() * 10;
        const lightness = 55 + Math.random() * 10;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}
/**
 * Get a contrasting text color (black or white) for a given background color
 * @param bgColor The background color (hex or hsl)
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
function getContrastColor(bgColor) {
    let r, g, b;
    if (bgColor.startsWith('#')) {
        // Hex color
        const hex = bgColor.substring(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    else if (bgColor.startsWith('hsl')) {
        // HSL color - convert to RGB
        const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match)
            return '#000000';
        const h = parseInt(match[1]) / 360;
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3) * 255;
            g = hue2rgb(p, q, h) * 255;
            b = hue2rgb(p, q, h - 1 / 3) * 255;
        }
    }
    else {
        // Default to black
        return '#000000';
    }
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
