'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Download, Trash2 } from 'lucide-react';
import { getNurseryLogoUrl } from '@/lib/nursery-logos';

interface Nursery {
  id: string;
  nursery_name: string;
  address: string;
  town: string;
  county: string;
  postcode: string;
  phone: string;
  nursery_group: string;
  latitude: number | null;
  longitude: number | null;
}

interface Job {
  id: string;
  nursery_id: string | null;
  nursery_name: string;
  nursery_location: string;
  postcode: string;
  job_title: string;
  hours: string;
  status: string;
}

export default function VacanciesAdmin() {
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploadingNurseries, setUploadingNurseries] = useState(false);
  const [uploadingJobs, setUploadingJobs] = useState(false);
  const [nurseriesFile, setNurseriesFile] = useState<File | null>(null);
  const [jobsFile, setJobsFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    fetchNurseries();
    fetchJobs();
  }, []);

  async function fetchNurseries() {
    const { data, error } = await supabase
      .from('nurseries')
      .select('*')
      .order('nursery_name', { ascending: true });

    if (error) {
      console.error('Error fetching nurseries:', error);
      return;
    }

    setNurseries(data || []);
  }

  async function fetchJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('nursery_name', { ascending: true });

    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }

    setJobs(data || []);
  }

  async function geocodePostcode(postcode: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '');
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

      if (!response.ok) {
        console.error(`Failed to geocode postcode: ${postcode}`);
        return null;
      }

      const data = await response.json();

      if (data.result) {
        return {
          latitude: data.result.latitude,
          longitude: data.result.longitude
        };
      }

      return null;
    } catch (error) {
      console.error(`Error geocoding postcode ${postcode}:`, error);
      return null;
    }
  }

  async function handleUploadNurseries(e: React.FormEvent) {
    e.preventDefault();
    if (!nurseriesFile) {
      alert('Please select a CSV file');
      return;
    }

    setUploadingNurseries(true);
    setUploadStatus('Reading nurseries CSV...');

    try {
      const text = await nurseriesFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Parse rows
      const nurseryData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length === 0) continue;

        const row: any = {};
        header.forEach((key, index) => {
          row[key] = values[index] || '';
        });

        nurseryData.push(row);
      }

      setUploadStatus(`Geocoding ${nurseryData.length} nurseries...`);

      // Delete existing nurseries (cascade will delete jobs too)
      await supabase.from('nurseries').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Geocode and insert nurseries
      let geocodedCount = 0;
      let failedGeocoding: string[] = [];

      for (let i = 0; i < nurseryData.length; i++) {
        const nursery = nurseryData[i];
        setUploadStatus(`Geocoding ${i + 1}/${nurseryData.length}: ${nursery.nursery_name}`);

        const coords = await geocodePostcode(nursery.postcode);

        if (coords) {
          geocodedCount++;
        } else {
          failedGeocoding.push(`${nursery.nursery_name} (${nursery.postcode})`);
        }

        const logoUrl = getNurseryLogoUrl(nursery.group || '', nursery.nursery_name);

        const { error } = await supabase.from('nurseries').insert({
          nursery_name: nursery.nursery_name,
          address: nursery.address || '',
          town: nursery.town || '',
          county: nursery.county || '',
          postcode: nursery.postcode,
          phone: nursery.phone || '',
          nursery_group: nursery.group || '',
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
          logo_url: logoUrl
        });

        if (error) {
          console.error('Error inserting nursery:', error);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      let statusMessage = `✅ Nurseries uploaded! ${geocodedCount}/${nurseryData.length} geocoded successfully`;
      if (failedGeocoding.length > 0) {
        statusMessage += `. ⚠️ Failed: ${failedGeocoding.slice(0, 2).join(', ')}${failedGeocoding.length > 2 ? '...' : ''}`;
      }
      setUploadStatus(statusMessage);
      setNurseriesFile(null);
      fetchNurseries();

      setTimeout(() => setUploadStatus(''), 6000);
    } catch (error) {
      console.error('Error uploading nurseries:', error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingNurseries(false);
    }
  }

  // Smart matching function for nursery names
  function findBestNurseryMatch(jobNurseryName: string, nurseries: any[]): any | null {
    const jobName = jobNurseryName.toLowerCase().trim();

    // Try exact match first
    let match = nurseries.find(n => n.nursery_name.toLowerCase() === jobName);
    if (match) return match;

    // Remove common prefixes/suffixes for matching
    const cleanJobName = jobName
      .replace(/^bambinos\s+/i, '')
      .replace(/\s+day nursery$/i, '')
      .replace(/\s+nursery$/i, '');

    // Try to match cleaned name
    match = nurseries.find(n => {
      const cleanNurseryName = n.nursery_name.toLowerCase()
        .replace(/^bambinos at\s+/i, '')
        .replace(/\s+day nursery$/i, '')
        .replace(/\s+nursery$/i, '');

      return cleanNurseryName === cleanJobName ||
             cleanNurseryName.includes(cleanJobName) ||
             cleanJobName.includes(cleanNurseryName);
    });

    if (match) return match;

    // Try partial match on significant words
    const jobWords = cleanJobName.split(/\s+/).filter(w => w.length > 3);
    match = nurseries.find(n => {
      const nurseryName = n.nursery_name.toLowerCase();
      return jobWords.every(word => nurseryName.includes(word));
    });

    return match;
  }

  async function handleUploadJobs(e: React.FormEvent) {
    e.preventDefault();
    if (!jobsFile) {
      alert('Please select a CSV file');
      return;
    }

    setUploadingJobs(true);
    setUploadStatus('Reading jobs CSV...');

    try {
      // First, fetch all nurseries to match against
      const { data: nurseriesData, error: nurseriesError } = await supabase
        .from('nurseries')
        .select('*');

      if (nurseriesError) throw nurseriesError;

      const text = await jobsFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Parse rows
      const jobsData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length === 0) continue;

        const row: any = {};
        header.forEach((key, index) => {
          row[key] = values[index] || '';
        });

        jobsData.push(row);
      }

      setUploadStatus(`Uploading ${jobsData.length} jobs...`);

      // Delete existing jobs
      await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert jobs with smart matching
      let matchedCount = 0;
      let unmatchedCount = 0;
      const unmatchedJobs: string[] = [];

      for (let i = 0; i < jobsData.length; i++) {
        const job = jobsData[i];
        setUploadStatus(`Uploading job ${i + 1}/${jobsData.length}`);

        // Find matching nursery using smart matching
        const nursery = findBestNurseryMatch(job.nursery_name, nurseriesData || []);

        if (nursery) {
          matchedCount++;
        } else {
          unmatchedCount++;
          unmatchedJobs.push(job.nursery_name);
        }

        const { error } = await supabase.from('jobs').insert({
          nursery_id: nursery?.id || null,
          nursery_name: job.nursery_name,
          nursery_location: job.nursery_location || '',
          postcode: job.postcode || '',
          job_title: job.job_title,
          hours: job.hours || '',
          status: job.status || 'active'
        });

        if (error) {
          console.error('Error inserting job:', error);
        }
      }

      let statusMessage = `Jobs uploaded successfully! ${matchedCount} matched to nurseries`;
      if (unmatchedCount > 0) {
        statusMessage += `, ${unmatchedCount} unmatched: ${unmatchedJobs.slice(0, 3).join(', ')}${unmatchedJobs.length > 3 ? '...' : ''}`;
      }
      setUploadStatus(statusMessage);

      setJobsFile(null);
      fetchJobs();

      setTimeout(() => setUploadStatus(''), 5000);
    } catch (error) {
      console.error('Error uploading jobs:', error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingJobs(false);
    }
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  async function handleDeleteAllData() {
    if (!confirm('Are you sure you want to delete ALL nurseries and jobs? This cannot be undone!')) {
      return;
    }

    try {
      await supabase.from('nurseries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      fetchNurseries();
      fetchJobs();
      alert('All data deleted successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data');
    }
  }

  function downloadCSV(data: any[], filename: string) {
    if (data.length === 0) {
      alert('No data to download');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vacancies - Admin</h1>
          <p className="text-slate-600 mt-2">Upload CSV files to manage nurseries and job listings</p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg">
            {uploadStatus}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Nurseries</h3>
            <p className="text-4xl font-bold text-slate-900">{nurseries.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Jobs</h3>
            <p className="text-4xl font-bold text-slate-900">{jobs.length}</p>
          </div>
        </div>

        {/* Upload Nurseries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Nurseries CSV</h2>
          <div className="text-sm text-slate-600 mb-4 space-y-2">
            <p className="font-medium">CSV should have columns: nursery_name, address, town, county, postcode, phone, group</p>
            <p className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
              ✨ Automatically geocodes all nurseries using postcodes.io API for geographic search functionality
            </p>
          </div>
          <form onSubmit={handleUploadNurseries} className="space-y-4">
            <div>
              <Label>Nurseries CSV File</Label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setNurseriesFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={uploadingNurseries || !nurseriesFile}>
                <Upload className="h-4 w-4 mr-2" />
                {uploadingNurseries ? 'Uploading...' : 'Upload Nurseries'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCSV(nurseries, 'nurseries.csv')}
                disabled={nurseries.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Current
              </Button>
            </div>
          </form>
        </div>

        {/* Upload Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Jobs CSV</h2>
          <div className="text-sm text-slate-600 mb-4 space-y-2">
            <p className="font-medium">CSV should have columns: nursery_name, nursery_location, postcode, job_title, hours, status</p>
            <p className="text-xs bg-green-50 border border-green-200 rounded p-2">
              ✨ Smart matching: Automatically links jobs to nurseries even with slight name variations (e.g., "Bambinos Plymstock" → "Plymstock Day Nursery")
            </p>
          </div>
          <form onSubmit={handleUploadJobs} className="space-y-4">
            <div>
              <Label>Jobs CSV File</Label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setJobsFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={uploadingJobs || !jobsFile}>
                <Upload className="h-4 w-4 mr-2" />
                {uploadingJobs ? 'Uploading...' : 'Upload Jobs'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCSV(jobs, 'jobs.csv')}
                disabled={jobs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Current
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-900">Danger Zone</h2>
          <Button
            variant="destructive"
            onClick={handleDeleteAllData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Nurseries & Jobs
          </Button>
        </div>

        {/* Preview Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Data Preview</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Nurseries ({nurseries.length})</h3>
            <div className="max-h-60 overflow-auto text-sm">
              {nurseries.slice(0, 10).map(n => (
                <div key={n.id} className="py-1 border-b border-slate-100">
                  {n.nursery_name} - {n.town}, {n.postcode}
                  {n.latitude && ` (${n.latitude.toFixed(4)}, ${n.longitude?.toFixed(4)})`}
                </div>
              ))}
              {nurseries.length > 10 && (
                <p className="text-slate-500 mt-2">...and {nurseries.length - 10} more</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Jobs ({jobs.length})</h3>
            <div className="max-h-60 overflow-auto text-sm">
              {jobs.slice(0, 10).map(j => (
                <div key={j.id} className="py-1 border-b border-slate-100">
                  {j.job_title} at {j.nursery_name} - {j.hours} ({j.status})
                </div>
              ))}
              {jobs.length > 10 && (
                <p className="text-slate-500 mt-2">...and {jobs.length - 10} more</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
