export const dashboardStats = [
  {
    id: "active-rentals",
    title: "Active Rentals",
    value: "1,284",
    trend: "+8.2%",
    type: "success",
  },
  {
    id: "monthly-revenue",
    title: "Monthly Revenue",
    value: "$42,500",
    trend: "+12.5%",
    type: "success",
  },
  {
    id: "pending-payments",
    title: "Pending Payments",
    value: "12",
    trend: "Stable",
    type: "neutral",
  },
  {
    id: "overdue-payments",
    title: "Overdue Payments",
    value: "5",
    trend: "Action Needed",
    type: "danger",
  },
];

export const revenueAnalytics = {
  labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
  values: [12000, 18000, 15000, 28000, 24000, 42000],
};

export const quickActions = [
  {
    id: "add-rental",
    label: "Add New Rental",
    action: "/rentals/new",
    primary: true,
  },
  {
    id: "add-customer",
    label: "Register Customer",
    action: "/customers/new",
  },
  {
    id: "add-item",
    label: "Inventory Intake",
    action: "/assets/new",
  },
];

export const recentActivities = [
  {
    id: "1",
    type: "rental",
    message: "John Doe signed a new lease for Skyline Apartment 4B",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "payment",
    message: "Payment of $1,200 received from Sarah Chen",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "maintenance",
    message: "Maintenance request submitted: Leaking Faucet - Unit 12",
    time: "Yesterday at 4:30 PM",
  },
];

export const upcomingReturns = [
  {
    id: "1",
    asset: "MacBook Pro M2",
    customer: "Mike Thompson",
    date: "Oct 24",
    time: "10:00 AM",
    icon: "laptop",
  },
  {
    id: "2",
    asset: "Sony Alpha A7 IV",
    customer: "Lisa Ray",
    date: "Oct 25",
    time: "02:30 PM",
    icon: "camera",
  },
  {
    id: "3",
    asset: "Tesla Model 3",
    customer: "David G.",
    date: "Oct 27",
    time: "09:00 AM",
    icon: "car",
  },
];

export const systemHealth = {
  status: "healthy",
  message: "All systems are operational.",
  pendingExports: 3,
};
