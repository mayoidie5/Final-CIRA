import { FormConfig } from '../types';

export const DEFAULT_FORM_CONFIG: FormConfig = {
  campuses: [
    {
      name: 'Maysan Campus',
      buildings: [
        {
          name: 'CEIT',
          rooms: [
            {
              name: 'Comlab 201 2nd Flr',
              unitIds: ['CL 201-01', 'CL 201-02', 'CL 201-03', 'CL 201-04', 'CL 201-05'],
            },
            {
              name: 'Comlab 202 2nd Flr',
              unitIds: ['CL 202-01', 'CL 202-02', 'CL 202-03', 'CL 202-04', 'CL 202-05'],
            },
            {
              name: 'Comlab 203 2nd Flr',
              unitIds: ['CL 203-01', 'CL 203-02', 'CL 203-03', 'CL 203-04', 'CL 203-05'],
            },
          ],
        },
        {
          name: 'COED',
          rooms: [
            {
              name: 'Edtech A 3rd Flr',
              unitIds: ['ED A-01', 'ED A-02', 'ED A-03', 'ED A-04', 'ED A-05'],
            },
            {
              name: 'Edtech B 4th Flr',
              unitIds: ['ED B-01', 'ED B-02', 'ED B-03', 'ED B-04', 'ED B-05'],
            },
          ],
        },
        {
          name: 'CABA',
          rooms: [
            {
              name: 'Caba Comlab 3rd Flr',
              unitIds: ['CABA-01', 'CABA-02', 'CABA-03', 'CABA-04', 'CABA-05'],
            },
          ],
        },
      ],
    },
    {
      name: 'Annex Campus',
      buildings: [
        {
          name: 'CAS',
          rooms: [
            {
              name: 'CAS A 3rd Flr',
              unitIds: ['CAS A-01', 'CAS A-02', 'CAS A-03', 'CAS A-04', 'CAS A-05'],
            },
            {
              name: 'CAS B 3rd Flr',
              unitIds: ['CAS B-01', 'CAS B-02', 'CAS B-03', 'CAS B-04', 'CAS B-05'],
            },
            {
              name: 'CAS C 3rd Flr',
              unitIds: ['CAS C-01', 'CAS C-02', 'CAS C-03', 'CAS C-04', 'CAS C-05'],
            },
          ],
        },
      ],
    },
  ],
  issueTypes: [
    {
      name: 'Hardware',
      subtypes: [
        'Monitor not working',
        'Keyboard malfunction',
        'Mouse not responding',
        'CPU not starting',
        'Power supply issue',
        'Others',
      ],
    },
    {
      name: 'Software',
      subtypes: [
        'Operating system error',
        'Application not working',
        'Software installation needed',
        'License issue',
        'Update required',
        'Others',
      ],
    },
    {
      name: 'Network',
      subtypes: [
        'No internet connection',
        'Slow connection',
        'Cannot connect to network',
        'Router issue',
        'Cable problem',
        'Others',
      ],
    },
    {
      name: 'Others',
      subtypes: ['Others'],
    },
  ],
};
