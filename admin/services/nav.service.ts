export const whiteLabelLinks = [
  {
    label: 'Home',
    key: '',
  },
  {
    label: 'My Bookings',
    key: 'bookings/mine',
  },
];

const adminLinks = [
  {
    label: 'Dashboard',
    key: 'dashboard',
  },
  {
    label: 'My Bookings',
    key: 'bookings/mine',
  },
  {
    label: 'Find Trips',
    key: 'find-trips',
  },
  {
    label: 'Trips',
    key: 'trips',
  },
  {
    label: 'Vessels',
    key: 'ships',
    children: [
      {
        label: 'Vessel List',
        key: 'ships',
      },
      {
        label: 'Upload Vessel Map',
        key: 'upload/seat-plans',
      },
    ],
  },
  {
    label: 'Reporting',
    key: 'reporting',
    children: [
      {
        label: 'Cancelled Trips',
        key: 'reporting/cancelled-trips',
      },
      {
        label: 'Collect Bookings',
        key: 'reporting/collect-bookings',
      },
      {
        label: 'Sales Per Teller',
        key: 'reporting/sales-per-teller',
      },
      {
        label: 'Summary Sales',
        key: 'reporting/summary',
      },
    ],
  },
  {
    label: 'Vouchers',
    key: 'vouchers',
  },
  {
    label: 'Bookings',
    key: 'bookings',
    children: [
      {
        label: 'Search Bookings',
        key: 'search',
      },
      {
        label: 'Download Bookings',
        key: 'download/bookings',
      },
      {
        label: 'Upload Bookings',
        key: 'upload/bookings',
      },
      {
        label: 'Log Bookings',
        key: 'log/bookings',
      },
    ],
  },
  {
    label: 'Rates',
    key: 'rate-tables',
  },
];

// Add superAdminLinks with all possible navigation items
const superAdminLinks = [
  ...adminLinks,
  {
    label: 'Administration',
    key: 'admin',
    children: [
      {
        label: 'User Management',
        key: 'users',
      },
      {
        label: 'Shipping Lines',
        key: 'shipping-lines',
      },
      {
        label: 'Travel Agencies',
        key: 'travel-agencies',
      },
      {
        label: 'System Settings',
        key: 'settings',
      },
    ],
  },
];

export const webLinks: {
  [role: string]: { label: string; key: string; children?: any[] }[];
} = {
  ShippingLineScanner: [
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
  ],
  ShippingLineStaff: [
    {
      label: 'My Bookings',
      key: 'bookings/mine',
    },
    {
      label: 'Find Trips',
      key: 'find-trips',
    },
    {
      label: 'Trips',
      key: 'trips',
    },
    {
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      label: 'Reporting',
      key: 'reporting',
      children: [
        {
          label: 'Cancelled Trips',
          key: 'reporting/cancelled-trips',
        },
        {
          label: 'Collect Bookings',
          key: 'reporting/collect-bookings',
        },
        {
          label: 'Sales Per Teller',
          key: 'reporting/sales-per-teller',
        },
        {
          label: 'Summary Sales',
          key: 'reporting/summary',
        },
      ],
    },
    {
      label: 'Bookings',
      key: 'bookings',
      children: [
        {
          label: 'Download Bookings',
          key: 'download/bookings',
        },
        {
          label: 'Search Bookings',
          key: 'search',
        },
      ],
    },
  ],
  TravelAgencyStaff: [
    {
      label: 'My Bookings',
      key: 'bookings/mine',
    },
    {
      label: 'Find Trips',
      key: 'find-trips',
    },
    {
      label: 'Bookings',
      key: 'bookings',
      children: [
        {
          label: 'Search Bookings',
          key: 'search',
        },
      ],
    },
  ],
  TravelAgencyAdmin: [
    {
      label: 'Rates',
      key: 'rate-tables',
    },
    {
      label: 'My Bookings',
      key: 'bookings/mine',
    },
    {
      label: 'Find Trips',
      key: 'find-trips',
    },
    {
      label: 'Bookings',
      key: 'bookings',
      children: [
        {
          label: 'Search Bookings',
          key: 'search',
        },
      ],
    },
  ],
  ShippingLineAdmin: adminLinks,
  SuperAdmin: superAdminLinks, // Update SuperAdmin to use superAdminLinks instead of adminLinks
};

// what role-specific links to show when account icon on top right is clicked
export const accountLinks: {
  [role: string]: { label: string; href: string }[];
} = {
  ShippingLineStaff: [
    {
      label: 'My Shipping Line',
      href: '/shipping-lines/mine',
    },
  ],
  ShippingLineAdmin: [
    {
      label: 'My Shipping Line',
      href: '/shipping-lines/mine',
    },
    {
      label: 'Preferences',
      href: '/preferences',
    },
  ],
  TravelAgencyStaff: [
    { label: 'My Travel Agency', href: '/travel-agencies/mine' },
  ],
  TravelAgencyAdmin: [
    { label: 'My Travel Agency', href: '/travel-agencies/mine' },
  ],
  SuperAdmin: [
    {
      label: 'All Shipping Lines',
      href: '/shipping-lines',
    },
    {
      label: 'All Travel Agencies',
      href: '/travel-agencies',
    },
    {
      label: 'Administration',
      href: '/admin',
    },
  ],
};
