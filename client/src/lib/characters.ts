export interface Character {
  id: string;
  name: string;
  rarity: 4 | 5;
  element: 'Aero' | 'Glacio' | 'Electro' | 'Fusion' | 'Havoc' | 'Spectro';
  weapon: 'Sword' | 'Broadblade' | 'Gauntlets' | 'Pistols' | 'Rectifier';
  image: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "jiyan",
    name: "Jiyan",
    rarity: 5,
    element: "Aero",
    weapon: "Broadblade",
    image: "https://images.unsplash.com/photo-1542261777-4badfa2337e6?w=400&h=400&fit=crop&q=80", // Placeholder
  },
  {
    id: "yinlin",
    name: "Yinlin",
    rarity: 5,
    element: "Electro",
    weapon: "Rectifier",
    image: "https://images.unsplash.com/photo-1560136203-d655f52864f7?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "calcharo",
    name: "Calcharo",
    rarity: 5,
    element: "Electro",
    weapon: "Broadblade",
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "verina",
    name: "Verina",
    rarity: 5,
    element: "Spectro",
    weapon: "Rectifier",
    image: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "jianxin",
    name: "Jianxin",
    rarity: 5,
    element: "Aero",
    weapon: "Gauntlets",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "lingyang",
    name: "Lingyang",
    rarity: 5,
    element: "Glacio",
    weapon: "Gauntlets",
    image: "https://images.unsplash.com/photo-1500336624523-d727130c3328?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "encore",
    name: "Encore",
    rarity: 5,
    element: "Fusion",
    weapon: "Rectifier",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "rover_spectro",
    name: "Rover (Spectro)",
    rarity: 5,
    element: "Spectro",
    weapon: "Sword",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "rover_havoc",
    name: "Rover (Havoc)",
    rarity: 5,
    element: "Havoc",
    weapon: "Sword",
    image: "https://images.unsplash.com/photo-1616084403156-9de11aefe6b4?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "yangyang",
    name: "Yangyang",
    rarity: 4,
    element: "Aero",
    weapon: "Sword",
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "chixia",
    name: "Chixia",
    rarity: 4,
    element: "Fusion",
    weapon: "Pistols",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "baizhi",
    name: "Baizhi",
    rarity: 4,
    element: "Glacio",
    weapon: "Rectifier",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "danjin",
    name: "Danjin",
    rarity: 4,
    element: "Havoc",
    weapon: "Sword",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "mortefi",
    name: "Mortefi",
    rarity: 4,
    element: "Fusion",
    weapon: "Pistols",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "sanhua",
    name: "Sanhua",
    rarity: 4,
    element: "Glacio",
    weapon: "Sword",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "taoqi",
    name: "Taoqi",
    rarity: 4,
    element: "Havoc",
    weapon: "Broadblade",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "aalto",
    name: "Aalto",
    rarity: 4,
    element: "Aero",
    weapon: "Pistols",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "yuanwu",
    name: "Yuanwu",
    rarity: 4,
    element: "Electro",
    weapon: "Gauntlets",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80",
  }
];

export const getCharacter = (id: string) => CHARACTERS.find(c => c.id === id);
