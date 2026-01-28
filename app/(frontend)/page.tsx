"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Newspaper,
  FileText,
  BookOpen,
  Heart,
  GraduationCap,
  Gift,
  FolderOpen,
  Briefcase,
} from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";

const quickLinks = [
  {
    title: "Company Updates",
    description: "Latest news and announcements",
    icon: Newspaper,
    href: "/updates",
    image: "/images/updates.webp",
  },
  {
    title: "Policies",
    description: "Important policies and procedures",
    icon: FileText,
    href: "/policies",
    image: "/images/policies.webp",
  },
  {
    title: "Handbooks",
    description: "Employee handbooks and guides",
    icon: BookOpen,
    href: "/handbooks",
    image: "/images/handbooks.webp",
  },
  {
    title: "Wellbeing Hub",
    description: "Resources for your wellbeing",
    icon: Heart,
    href: "/wellbeing",
    image: "/images/wellbeing.webp",
  },
  {
    title: "Training",
    description: "Professional development and courses",
    icon: GraduationCap,
    href: "/training",
    image: "/images/training.webp",
  },
  {
    title: "Benefits",
    description: "Your employee benefits and perks",
    icon: Gift,
    href: "/benefits",
    image: "/images/benefits.webp",
  },
  {
    title: "HR Library",
    description: "HR documents and resources",
    icon: FolderOpen,
    href: "/hr-library",
    image: "/images/hr-library.webp",
  },
  {
    title: "Vacancies",
    description: "Browse and apply for open positions",
    icon: Briefcase,
    href: "/vacancies",
    image: "/images/vacancies.webp",
  },
];

function NetflixCard({ link }: { link: typeof quickLinks[0] }) {
  const [imageError, setImageError] = useState(false);
  const Icon = link.icon;

  return (
    <Link href={link.href} className="group">
      <div className="relative h-64 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
        {/* Background Image or Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600">
          {!imageError && (
            <Image
              src={link.image}
              alt={link.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Dark Gradient Overlay at Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Icon */}
          <div className="mb-3">
            <Icon className="h-8 w-8 text-white drop-shadow-lg" />
          </div>

          {/* Title and Description */}
          <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">
            {link.title}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {link.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">
          iStep Connect
        </h1>
        <SearchBar />
      </div>

      {/* Netflix-Style Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
        {quickLinks.map((link) => (
          <NetflixCard key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
}
