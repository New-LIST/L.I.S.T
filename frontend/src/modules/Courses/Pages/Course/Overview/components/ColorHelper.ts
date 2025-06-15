const fallbackColors = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#0288d1', '#d32f2f'];

const typeColorMap: Record<string, string> = {};

export const getTypeColor = (typeId: string): string => {
    if (typeColorMap[typeId]) return typeColorMap[typeId];

    const hash = Array.from(typeId).reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const color = fallbackColors[hash % fallbackColors.length];

    typeColorMap[typeId] = color;
    return color;
};
