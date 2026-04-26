'use client';

import dynamic from 'next/dynamic';

const StapPage = dynamic(() => import('./_page-impl'), { ssr: false });

export default StapPage;
