'use client';

import dynamic from 'next/dynamic';

const EmployerPage = dynamic(() => import('./_page-impl'), { ssr: false });

export default EmployerPage;
