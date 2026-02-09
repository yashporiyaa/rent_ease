export const invoiceDetails = {
  id: "INV-1001",
  status: "unpaid",
  issueDate: "2026-02-01",
  dueDate: "2026-02-15",
  customer: {
    name: "John Doe",
    phone: "9876543210",
  },
  rental: {
    id: "RNT-1023",
    startDate: "2026-02-01",
    endDate: "2026-02-10",
  },
  totalAmount: 4500,
  items: [
    {
      id: "i1",
      name: "Designer Kurta",
      quantity: 2,
      price: 1000,
    },
    {
      id: "i2",
      name: "Wedding Sherwani",
      quantity: 1,
      price: 2500,
    },
  ],
};
