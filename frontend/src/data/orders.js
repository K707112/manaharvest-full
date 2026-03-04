export const mockOrders = [
  {
    id: "MH-ORD-2024",
    date: "2 Mar 2026",
    status: "out_for_delivery",
    items: [
      { name: "Country Tomatoes", qty: "1 kg", price: 45 },
      { name: "Green Coriander", qty: "250g", price: 15 },
      { name: "Spinach Bunch", qty: "2 bunches", price: 50 },
    ],
    total: 110,
    deliverySlot: "10:00 AM – 12:00 PM",
    address: "Flat 4B, Green Valley Apartments, Gachibowli, Hyderabad",
    timeline: [
      { status: "ordered", label: "Order Placed", time: "6:45 AM", done: true },
      { status: "harvesting", label: "Harvesting", time: "7:30 AM", done: true },
      { status: "packed", label: "Packed & Sorted", time: "8:15 AM", done: true },
      { status: "out_for_delivery", label: "Out for Delivery", time: "9:00 AM", done: true },
      { status: "delivered", label: "Delivered", time: "Est. 11:00 AM", done: false },
    ]
  },
  {
    id: "MH-ORD-2023",
    date: "24 Feb 2026",
    status: "delivered",
    items: [
      { name: "Ridge Gourd", qty: "500g", price: 18 },
      { name: "Drumstick", qty: "4 pieces", price: 30 },
    ],
    total: 48,
    deliverySlot: "10:00 AM – 12:00 PM",
    address: "Flat 4B, Green Valley Apartments, Gachibowli, Hyderabad",
    timeline: [
      { status: "ordered", label: "Order Placed", time: "7:00 AM", done: true },
      { status: "harvesting", label: "Harvesting", time: "7:45 AM", done: true },
      { status: "packed", label: "Packed & Sorted", time: "8:30 AM", done: true },
      { status: "out_for_delivery", label: "Out for Delivery", time: "9:15 AM", done: true },
      { status: "delivered", label: "Delivered", time: "10:50 AM", done: true },
    ]
  }
];

export const mockUser = {
  name: "Priya Sharma",
  email: "priya.sharma@gmail.com",
  phone: "+91 98765 43210",
  address: "Flat 4B, Green Valley Apartments, Gachibowli, Hyderabad – 500032",
  subscription: { plan: "Medium Family", nextDelivery: "9 Mar 2026", status: "active" },
  wallet: 120,
  referralCode: "PRIYA200",
  referralEarned: 400,
};
