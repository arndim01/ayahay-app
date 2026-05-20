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

export const onlineLinks = [
  ...whiteLabelLinks,
  {
    label: 'Contact',
    key: 'contact',
  },
  {
    label: 'Partners',
    key: 'partners',
  },
  {
    label: 'Solution',
    key: 'solution',
  },
  {
    label: 'Resources',
    key: 'resources',
    children: [
      {
        label: 'Blogs',
        key: 'resources/blogs',
      },
      {
        label: 'Vlogs',
        key: 'resources/vlogs',
      },
    ],
  },
];
