import { FileType } from './types';

export const files: FileType[] = [
  {
    id: '1',
    name: 'Project Alpha',
    type: 'folder',
    size: 20971520, // 20 MB
    lastModified: new Date('2023-10-26T10:00:00Z'),
    path: '/Project Alpha',
    children: [
      {
        id: '1-1',
        name: 'design-assets.zip',
        type: 'other',
        size: 15728640, // 15 MB
        lastModified: new Date('2023-10-25T14:30:00Z'),
        path: '/Project Alpha/design-assets.zip',
      },
      {
        id: '1-2',
        name: 'Roadmap.pdf',
        type: 'pdf',
        size: 2097152, // 2 MB
        lastModified: new Date('2023-10-26T09:00:00Z'),
        path: '/Project Alpha/Roadmap.pdf',
      },
    ],
  },
  {
    id: '2',
    name: 'Financials',
    type: 'folder',
    size: 5242880, // 5 MB
    lastModified: new Date('2023-10-20T16:45:00Z'),
    path: '/Financials',
    children: [
      {
        id: '2-1',
        name: 'Q3-Report.pdf',
        type: 'pdf',
        size: 3145728, // 3 MB
        lastModified: new Date('2023-10-20T15:00:00Z'),
        path: '/Financials/Q3-Report.pdf',
      },
      {
        id: '2-2',
        name: 'Q4-Forecast.pdf',
        type: 'pdf',
        size: 2097152, // 2 MB
        lastModified: new Date('2023-10-20T16:45:00Z'),
        path: '/Financials/Q4-Forecast.pdf',
      },
    ],
  },
  {
    id: '3',
    name: 'Website Mockups',
    type: 'folder',
    size: 12582912, // 12 MB
    lastModified: new Date('2023-11-01T11:20:00Z'),
    path: '/Website Mockups',
    children: [
      {
        id: '3-1',
        name: 'Homepage.png',
        type: 'image',
        size: 4194304, // 4 MB
        lastModified: new Date('2023-11-01T10:00:00Z'),
        path: '/Website Mockups/Homepage.png',
        thumbnailUrl: 'https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      {
        id: '3-2',
        name: 'About-Us.png',
        type: 'image',
        size: 3145728, // 3 MB
        lastModified: new Date('2023-11-01T11:20:00Z'),
        path: '/Website Mockups/About-Us.png',
        thumbnailUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
  },
  {
    id: '4',
    name: 'app.js',
    type: 'code',
    size: 15360, // 15 KB
    lastModified: new Date('2023-10-29T18:05:00Z'),
    path: '/app.js',
  },
  {
    id: '5',
    name: 'notes.md',
    type: 'text',
    size: 2048, // 2 KB
    lastModified: new Date('2023-11-02T14:00:00Z'),
    path: '/notes.md',
  },
  {
    id: '6',
    name: 'Company-Logo.svg',
    type: 'image',
    size: 102400, // 100 KB
    lastModified: new Date('2023-09-15T09:30:00Z'),
    path: '/Company-Logo.svg',
    thumbnailUrl: 'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '7',
    name: 'Client Contract.pdf',
    type: 'pdf',
    size: 512000, // 500 KB
    lastModified: new Date('2023-10-18T12:00:00Z'),
    path: '/Client Contract.pdf',
  },
];
