// ========= MOCK DATA =========

export const products = [
  { id: 1, name: 'Tomatoes', emoji: '🍅', category: 'Vegetables', price: 45, unit: 'kg', stock: 42, harvestTime: '6:30 AM', batchId: 'MH-0301-TOM', farmName: 'Ramu Farm', village: 'Chegunta', description: 'Juicy desi tomatoes, hand-picked at peak ripeness', tags: ['Organic', 'No Pesticides'] },
  { id: 2, name: 'Spinach', emoji: '🥬', category: 'Leafy', price: 30, unit: 'bunch', stock: 28, harvestTime: '5:45 AM', batchId: 'MH-0301-SPN', farmName: 'Lakshmi Fields', village: 'Toopran', description: 'Tender baby spinach, dark and rich in iron', tags: ['Organic', 'Fresh'] },
  { id: 3, name: 'Brinjal', emoji: '🍆', category: 'Vegetables', price: 35, unit: 'kg', stock: 15, harvestTime: '7:00 AM', batchId: 'MH-0301-BRJ', farmName: 'Krishna Garden', village: 'Medak', description: 'Purple glossy brinjals, perfect for curries', tags: ['Farm Fresh'] },
  { id: 4, name: 'Coriander', emoji: '🌿', category: 'Herbs', price: 20, unit: 'bunch', stock: 60, harvestTime: '5:30 AM', batchId: 'MH-0301-COR', farmName: 'Sita Farms', village: 'Zaheerabad', description: 'Fragrant fresh coriander, thick stems & full leaves', tags: ['Organic', 'Aromatic'] },
  { id: 5, name: 'Lady Finger', emoji: '🫛', category: 'Vegetables', price: 40, unit: 'kg', stock: 33, harvestTime: '7:15 AM', batchId: 'MH-0301-LDY', farmName: 'Ramu Farm', village: 'Chegunta', description: 'Tender young okra, no tough seeds inside', tags: ['Fresh Pick'] },
  { id: 6, name: 'Cucumber', emoji: '🥒', category: 'Vegetables', price: 28, unit: 'kg', stock: 50, harvestTime: '6:00 AM', batchId: 'MH-0301-CUC', farmName: 'Green Valley', village: 'Narayankhed', description: 'Cool & crisp cucumbers, great for salads', tags: ['Organic', 'No Pesticides'] },
  { id: 7, name: 'Drumstick', emoji: '🪵', category: 'Vegetables', price: 55, unit: 'kg', stock: 8, harvestTime: '8:00 AM', batchId: 'MH-0301-DRM', farmName: 'Krishna Garden', village: 'Medak', description: 'Long tender drumsticks, perfect for sambar', tags: ['Rare Find'] },
  { id: 8, name: 'Methi', emoji: '🌾', category: 'Leafy', price: 25, unit: 'bunch', stock: 45, harvestTime: '5:30 AM', batchId: 'MH-0301-MTH', farmName: 'Lakshmi Fields', village: 'Toopran', description: 'Fresh fenugreek leaves, slightly bitter & nutritious', tags: ['Organic'] },
];

export const farmers = [
  { id: 1, name: 'Ramu Yadav', emoji: '👨‍🌾', village: 'Chegunta', years: 22, crops: ['Tomatoes', 'Lady Finger', 'Brinjal'], description: 'Third-generation farmer known for his natural pest control techniques. Ramu uses neem oil and marigold borders to protect his crops without chemicals.', rating: 4.9, reviewCount: 284, phone: '+91 98765 43210', joinedYear: 2023 },
  { id: 2, name: 'Lakshmi Devi', emoji: '👩‍🌾', village: 'Toopran', years: 15, crops: ['Spinach', 'Methi', 'Coriander'], description: 'Expert in leafy greens cultivation. Lakshmi runs a women-led farming cooperative and teaches soil enrichment techniques to neighboring villages.', rating: 5.0, reviewCount: 196, phone: '+91 98765 11223', joinedYear: 2023 },
  { id: 3, name: 'Krishna Reddy', emoji: '🧑‍🌾', village: 'Medak', years: 30, crops: ['Brinjal', 'Drumstick', 'Capsicum'], description: 'Veteran farmer with the most diverse crop rotation in our network. Krishna's 5-acre farm uses traditional Telugu farming wisdom passed down 4 generations.', rating: 4.8, reviewCount: 342, phone: '+91 87654 32109', joinedYear: 2022 },
  { id: 4, name: 'Sita Goud', emoji: '👩‍🌾', village: 'Zaheerabad', years: 11, crops: ['Coriander', 'Curry Leaves', 'Green Chili'], description: 'Specialist in aromatic herbs and spices. Sita was among the first farmers to join ManaHarvest and helped us establish our quality standards.', rating: 4.9, reviewCount: 165, phone: '+91 76543 21098', joinedYear: 2022 },
];

export const subscriptionPlans = [
  {
    id: 'small',
    name: 'Small Family',
    emoji: '🏠',
    price: 399,
    period: 'week',
    vegetables: 7,
    weight: '4–5 kg',
    members: '2–3 people',
    popular: false,
    features: ['7 seasonal vegetables', '4–5 kg weekly box', 'Free delivery', 'Batch transparency', 'Easy pause/cancel'],
  },
  {
    id: 'medium',
    name: 'Medium Family',
    emoji: '🏡',
    price: 699,
    period: 'week',
    vegetables: 9,
    weight: '8–9 kg',
    members: '4–5 people',
    popular: true,
    features: ['9 seasonal vegetables', '8–9 kg weekly box', 'Free delivery', 'Batch transparency', 'Priority harvest selection', 'Free replacement guarantee'],
  },
  {
    id: 'large',
    name: 'Large Family',
    emoji: '🏘️',
    price: 999,
    period: 'week',
    vegetables: 12,
    weight: '14–15 kg',
    members: '6+ people',
    popular: false,
    features: ['12+ seasonal vegetables', '14–15 kg weekly box', 'Free delivery', 'Batch transparency', 'Priority harvest selection', 'Free replacement guarantee', 'Bonus herbs monthly'],
  },
];

export const orders = [
  {
    id: 'ORD-0012',
    date: '2026-03-01',
    items: [
      { name: 'Tomatoes', qty: '2 kg', price: 90 },
      { name: 'Spinach', qty: '1 bunch', price: 30 },
      { name: 'Coriander', qty: '2 bunches', price: 40 },
    ],
    total: 160,
    status: 'out_for_delivery',
    deliveryTime: '11:30 AM – 12:30 PM',
    batchIds: ['MH-0301-TOM', 'MH-0301-SPN', 'MH-0301-COR'],
    address: 'Flat 4B, Green Residency, Miyapur, Hyderabad',
    harvestTime: '6:30 AM',
    farmName: 'Multiple Farms',
  },
  {
    id: 'ORD-0011',
    date: '2026-02-26',
    items: [
      { name: 'Brinjal', qty: '1 kg', price: 35 },
      { name: 'Lady Finger', qty: '500g', price: 20 },
    ],
    total: 55,
    status: 'delivered',
    deliveryTime: 'Delivered at 10:45 AM',
    batchIds: ['MH-0226-BRJ', 'MH-0226-LDY'],
    address: 'Flat 4B, Green Residency, Miyapur, Hyderabad',
    harvestTime: '7:00 AM',
    farmName: 'Krishna Garden',
  },
];

export const statusSteps = ['Harvesting', 'Packed', 'Out for Delivery', 'Delivered'];

export const batchDetails = {
  'MH-0301-TOM': {
    product: 'Tomatoes',
    emoji: '🍅',
    batchId: 'MH-0301-TOM',
    harvestDate: '2026-03-01',
    harvestTime: '6:30 AM',
    farmer: 'Ramu Yadav',
    village: 'Chegunta, Medak District',
    totalHarvested: '120 kg',
    sold: '78 kg',
    remaining: '42 kg',
    soilType: 'Red Loamy',
    waterSource: 'Borewell',
    pesticides: 'None – Organic Neem Spray',
    certifications: ['Natural Farming', 'No Chemical Pesticides'],
    timeline: [
      { time: '5:00 AM', event: 'Field inspection by Ramu Yadav' },
      { time: '6:30 AM', event: 'Harvest begins – hand-picked' },
      { time: '7:45 AM', event: 'Quality check & weighing' },
      { time: '8:30 AM', event: 'Packed & loaded for city dispatch' },
      { time: '9:15 AM', event: 'Arrived at ManaHarvest hub' },
      { time: '10:00 AM', event: 'Out for delivery to customers' },
    ],
  },
};

export const mockUser = {
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '+91 98765 00001',
  address: 'Flat 4B, Green Residency, Miyapur, Hyderabad',
  subscription: 'medium',
  walletBalance: 120,
  referralCode: 'PRIYA50',
  referralsCount: 3,
};
