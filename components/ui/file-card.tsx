import * as React from "react";
import { FileText, Table, Presentation, Image as ImageIcon, File } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type FileType = "pdf" | "word" | "excel" | "powerpoint" | "image" | "other";

interface FileCardProps {
  fileName: string;
  fileType: FileType;
  fileSize?: string;
  onDownload: () => void;
  className?: string;
}

const fileTypeConfig = {
  pdf: {
    icon: FileText,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "PDF",
  },
  word: {
    icon: FileText,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "Word",
  },
  excel: {
    icon: Table,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "Excel",
  },
  powerpoint: {
    icon: Presentation,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "PowerPoint",
  },
  image: {
    icon: ImageIcon,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "Image",
  },
  other: {
    icon: File,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-700",
    label: "File",
  },
};

export function FileCard({
  fileName,
  fileType,
  fileSize,
  onDownload,
  className,
}: FileCardProps) {
  const config = fileTypeConfig[fileType] || fileTypeConfig.other;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {/* Big Icon */}
      <div
        className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4",
          config.bgColor
        )}
      >
        <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8", config.iconColor)} />
      </div>

      {/* File Name */}
      <h3 className="font-bold text-xl sm:text-2xl text-gray-900 mb-2 break-words w-full">
        {fileName}
      </h3>

      {/* File Type & Size */}
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
        {config.label}
        {fileSize && ` • ${fileSize}`}
      </p>

      {/* Download Button */}
      <Button
        variant="primary"
        className="w-full text-sm sm:text-base"
        onClick={onDownload}
      >
        Download ↓
      </Button>
    </div>
  );
}
