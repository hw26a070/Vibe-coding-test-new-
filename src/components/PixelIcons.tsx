import React from 'react';

interface PixelGrid {
  colorMap: Record<string, string>;
  grid: string[];
}

const getPixelGrid = (type: string): PixelGrid => {
  switch (type) {
    case 'mail': // [IN] style (Place road / dispatch / mail)
      return {
        colorMap: {
          '1': '#ffb800', // Gold outline/body
          '2': '#ffffff', // White envelope flap detail
          '3': '#3b82f6', // Blue post accent
        },
        grid: [
          '01111110',
          '12111121',
          '11211211',
          '11122111',
          '11111111',
          '13111131',
          '01111110',
          '00000000'
        ]
      };
    case 'rotate': // [TURN] style (clockwise rotate loop)
      return {
        colorMap: {
          '1': '#ffb800', // Gold loop parts
          '2': '#ffffff', // Arrow head highlights
        },
        grid: [
          '00111000',
          '01101200',
          '11000110',
          '11020000',
          '00002011',
          '01100011',
          '00210110',
          '00011100'
        ]
      };
    case 'lock': // [LOCK] Locked path / grid position
      return {
        colorMap: {
          '1': '#94a3b8', // Silver shackle
          '2': '#ef4444', // Red lock body
          '3': '#ffffff', // Keyhole highlight
        },
        grid: [
          '00111100',
          '01000010',
          '01000010',
          '22222222',
          '22232222',
          '22232222',
          '22222222',
          '00000000'
        ]
      };
    case 'walk': // [WALK] / Walk runner / hero walking
      return {
        colorMap: {
          '1': '#ffffff', // Head & torso
          '2': '#ffb800', // Limbs & movement accents
        },
        grid: [
          '00011000',
          '00011000',
          '00211100',
          '02011020',
          '00011000',
          '00100100',
          '01000010',
          '20000020'
        ]
      };
    case 'swords': // [SWORDS] / Combat swords
      return {
        colorMap: {
          '1': '#ef4444', // Sword handles/glowing red power
          '2': '#cbd5e1', // Steel blades
        },
        grid: [
          '20000002',
          '02000020',
          '00200200',
          '00022000',
          '00011000',
          '00100100',
          '01000010',
          '10000001'
        ]
      };
    case 'shield': // [SHIELD] / Defense shield block
      return {
        colorMap: {
          '1': '#ffb800', // Golden frame
          '2': '#3b82f6', // Blue plate center
        },
        grid: [
          '11111111',
          '12222221',
          '12222221',
          '01222210',
          '01222210',
          '00122100',
          '00122100',
          '00011000'
        ]
      };
    case 'trophy': // [TROPHY] / Victory cup
      return {
        colorMap: {
          '1': '#facc15', // Bright yellow gold
          '2': '#ca8a04', // Dark gold shadow
          '3': '#ffffff', // Gloss reflections
        },
        grid: [
          '11111111',
          '13111121',
          '21111122',
          '02111120',
          '00211200',
          '00011000',
          '00111100',
          '01111110'
        ]
      };
    case 'warning': // [WARN] / Danger / warning triangle
      return {
        colorMap: {
          '1': '#facc15', // Yellow warning plate
          '2': '#000000', // Black alert symbol interior
        },
        grid: [
          '00001000',
          '00011100',
          '00112110',
          '01122211',
          '01112111',
          '11110111',
          '11112111',
          '11111111'
        ]
      };
    default:
      return {
        colorMap: {
          '1': '#ffb800',
        },
        grid: [
          '00111100',
          '01111110',
          '11111111',
          '11111111',
          '11111111',
          '11111111',
          '01111110',
          '00111100'
        ]
      };
  }
};

export const PixelIcon: React.FC<{ type: 'mail' | 'rotate' | 'lock' | 'walk' | 'swords' | 'shield' | 'trophy' | 'warning'; size?: number; className?: string }> = ({ 
  type, 
  size = 14,
  className = ''
}) => {
  const pixels = getPixelGrid(type);
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 8 8" 
      shapeRendering="crispEdges"
      className={`shrink-0 inline-block ${className}`}
    >
      {pixels.grid.map((row, rIdx) => (
        <React.Fragment key={`pixel-row-${rIdx}`}>
          {row.split('').map((char, cIdx) => {
            if (char === '0') return null;
            const fill = pixels.colorMap[char];
            return (
              <rect 
                key={`pixel-cell-${rIdx}-${cIdx}`} 
                x={cIdx} 
                y={rIdx} 
                width={1} 
                height={1} 
                fill={fill} 
              />
            );
          })}
        </React.Fragment>
      ))}
    </svg>
  );
};
