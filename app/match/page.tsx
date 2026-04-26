'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MatchedJob {
  id: string;
  title: string;
  category: string;
  type: string;
  salary: string;
  location: string;
  url: string;
  similarity?: number;
}

const PLACEHOLDER = `Example:
I have 3 years of experience working in restaurants and cafes as a waiter and barista. I speak Arabic, English, and some Dutch. I am hardworking, friendly, and good with customers. I am looking for part-time or full-time work in Amsterdam.`;

export default function MatchPage() {
  const [name, setName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (resumeText.trim().length < 10) return;

    setLoading(true);
    setError('');
    setWarning('');
    setDone(false);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, name, save: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Match failed');
      setJobs(data.jobs || []);
      if (data.warning) setWarning(data.warning);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function scoreBar(similarity?: number) {
    if (!similarity) return null;
    const pct = Math.round(similarity * 100);
    const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-orange-400';
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">neighborhood-piper</Link>
        <div className="flex gap-4 text-sm text-gray-600">
          <Link href="/jobs" className="hover:text-gray-900">Job Map</Link>
          <Link href="/match" className="text-gray-900 font-semibold">Match Me</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your best-fit jobs</h1>
          <p className="text-gray-500">Describe your experience and skills in any language — Dutch, Arabic, English, Tigrinya. We'll find matching jobs in Amsterdam.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Yohannes"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tell us about yourself <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Skills, experience, languages, what kind of work you want. Any language is fine.</p>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={7}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              required
              minLength={10}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || resumeText.trim().length < 10}
            className="w-full bg-gray-950 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? 'Finding matches…' : 'Find matching jobs'}
          </button>
        </form>

        {warning && (
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4">{warning}</p>
        )}

        {done && jobs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No matches found. Try adding more detail about your experience.</p>
        )}

        {jobs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{jobs.length} best matches for you</h2>
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-400 w-5">#{i + 1}</span>
                        <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      </div>
                      {scoreBar(job.similarity)}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.type && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{job.type}</span>
                        )}
                        {job.salary && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{job.salary}</span>
                        )}
                        {job.location && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{job.location}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm shrink-0">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
