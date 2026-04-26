'use client';

import dynamic from 'next/dynamic';

const JuntaPage = dynamic(() => import('./_page-impl'), { ssr: false });

export default JuntaPage;
