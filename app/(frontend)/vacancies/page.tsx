"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Briefcase, Search, Navigation } from "lucide-react";
import Image from "next/image";
import { getNurseryLogoUrl } from "@/lib/nursery-logos";
import { SearchBar } from "@/components/search/search-bar";

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

interface Nursery {
  id: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  nursery_group: string | null;
  nursery_name: string;
}

interface JobWithDistance extends Job {
  distance?: number;
  nursery?: Nursery;
}

export default function VacanciesPage() {
  const [jobs, setJobs] = useState<JobWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRole, setSearchRole] = useState("");
  const [searchPostcode, setSearchPostcode] = useState("");
  const [searchNursery, setSearchNursery] = useState("");
  const [maxDistance, setMaxDistance] = useState<number>(50); // miles
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Geocode postcode when user types
    const timer = setTimeout(() => {
      if (searchPostcode.length >= 3) {
        geocodePostcode(searchPostcode);
      } else {
        setSearchLocation(null);
        // Recalculate distances without location filter
        calculateDistances(null);
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [searchPostcode]);

  async function fetchJobs() {
    // Fetch jobs with nursery data
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      setLoading(false);
      return;
    }

    // Fetch nurseries with coordinates and logos
    const { data: nurseriesData, error: nurseriesError } = await supabase
      .from('nurseries')
      .select('*');

    if (nurseriesError) {
      console.error('Error fetching nurseries:', nurseriesError);
    }

    // Merge jobs with nursery data
    const jobsWithNurseries = (jobsData || []).map(job => ({
      ...job,
      nursery: nurseriesData?.find(n => n.id === job.nursery_id)
    }));

    setJobs(jobsWithNurseries);
    setLoading(false);
  }

  async function geocodePostcode(postcode: string) {
    setGeocoding(true);
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '');
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

      if (!response.ok) {
        setSearchLocation(null);
        setGeocoding(false);
        return;
      }

      const data = await response.json();

      if (data.result) {
        const location = {
          lat: data.result.latitude,
          lng: data.result.longitude
        };
        setSearchLocation(location);
        calculateDistances(location);
      } else {
        setSearchLocation(null);
      }
    } catch (error) {
      console.error('Error geocoding postcode:', error);
      setSearchLocation(null);
    }
    setGeocoding(false);
  }

  function calculateDistances(location: { lat: number; lng: number } | null) {
    if (!location) {
      setJobs(prev => prev.map(job => ({ ...job, distance: undefined })));
      return;
    }

    setJobs(prev => prev.map(job => {
      if (!job.nursery?.latitude || !job.nursery?.longitude) {
        return { ...job, distance: undefined };
      }

      const distance = calculateDistance(
        location.lat,
        location.lng,
        job.nursery.latitude,
        job.nursery.longitude
      );

      return { ...job, distance };
    }));
  }

  // Haversine formula to calculate distance between two points
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get unique nursery names for dropdown
  const uniqueNurseries = useMemo(() => {
    const nurserySet = new Set<string>();
    jobs.forEach(job => {
      if (job.nursery_name) {
        nurserySet.add(job.nursery_name);
      }
    });
    return Array.from(nurserySet).sort();
  }, [jobs]);

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesRole = !searchRole ||
        job.job_title.toLowerCase().includes(searchRole.toLowerCase());

      const matchesNursery = !searchNursery ||
        job.nursery_name === searchNursery;

      // Geographic distance filter
      // If we have a search location, only show jobs with valid distances within range
      const matchesDistance = !searchLocation || (job.distance !== undefined && job.distance <= maxDistance);

      return matchesRole && matchesNursery && matchesDistance;
    });

    // Sort by distance if we have a search location
    if (searchLocation) {
      filtered.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    return filtered;
  }, [jobs, searchRole, searchNursery, searchLocation, maxDistance]);

  return (
    <div className="px-24 py-20">
      {/* Page Header */}
      <div className="mb-24 flex items-center justify-between">
        <h1 className="text-6xl font-bold text-gray-900">Current Vacancies</h1>
        <SearchBar />
      </div>

      {/* Search Filters */}
      <div className="mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by role..."
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter postcode for geo search..."
              value={searchPostcode}
              onChange={(e) => setSearchPostcode(e.target.value)}
              className="pl-10"
            />
            {geocoding && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
            <select
              value={searchNursery}
              onChange={(e) => setSearchNursery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 appearance-none cursor-pointer"
            >
              <option value="">All Nurseries</option>
              {uniqueNurseries.map((nursery) => (
                <option key={nursery} value={nursery}>
                  {nursery}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance Slider */}
        {searchLocation && (
          <div className="bg-white p-6 rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                Search Radius
              </label>
              <span className="text-sm font-bold text-blue-600">{maxDistance} miles</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 miles</span>
              <span>100 miles</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> vacancies
            {searchLocation && <span className="text-blue-600 ml-2">(sorted by distance)</span>}
          </p>
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading vacancies...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]">
          <p className="text-gray-600">
            {jobs.length === 0
              ? "No vacancies available at the moment. Please check back later."
              : "No vacancies match your search criteria. Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => {
            const logoUrl = job.nursery?.logo_url || getNurseryLogoUrl(job.nursery?.nursery_group || '', job.nursery?.nursery_name || job.nursery_name);

            return (
              <div
                key={job.id}
                className="p-8 bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <div className="flex items-start gap-6">
                  {/* Nursery Logo */}
                  <div className="flex-shrink-0">
                    <Image
                      src={logoUrl}
                      alt={job.nursery_name}
                      width={120}
                      height={120}
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">{job.job_title}</h3>
                      <Badge variant="success">{job.status}</Badge>
                    </div>

                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-lg">{job.nursery_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>{job.nursery_location} {job.postcode}</span>
                        {job.distance !== undefined && (
                          <Badge variant="secondary" className="ml-2">
                            {job.distance.toFixed(1)} miles away
                          </Badge>
                        )}
                      </div>

                      {job.hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <span>{job.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
