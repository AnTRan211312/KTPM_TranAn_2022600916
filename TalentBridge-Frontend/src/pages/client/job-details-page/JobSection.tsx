"use client";

import { Button } from "@/components/ui/button.tsx";
import {
  Building2,
  MapPin,
  Briefcase,
  Share2,
  Heart,
} from "lucide-react";
import type { Job } from "@/types/job";
import { Badge } from "@/components/ui/badge.tsx";
import RichTextPreview from "@/components/custom/RichText/index-preview.tsx";
import { levelColors, levelLabels } from "@/utils/tagColorMapper.ts";
import { getJobStatus } from "@/utils/jobStatusHelper.ts";

type JobSectionProps = {
  job: Job;
};

const JobSection = ({ job }: JobSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Job Header - Compact */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-white">
              {job.company.logoUrl ? (
                <img
                  src={job.company.logoUrl || "/placeholder.svg"}
                  alt={job.company.name}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Building2 className="h-10 w-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* Title */}
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {job.name}
                </h1>

                {/* Company */}
                <a
                  href={`/companies/${job.company.id}`}
                  className="mb-2 block text-lg font-semibold text-gray-700 hover:text-orange-600 hover:underline"
                >
                  {job.company.name}
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-200 text-gray-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  title="Chia sẻ công việc này"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  title="Lưu công việc"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Location */}
            <p className="mb-3 flex items-center text-sm text-gray-600">
              <MapPin className="mr-1 h-4 w-4" />
              {job.company.address}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${levelColors[job.level]}`}>
                {levelLabels[job.level]}
              </Badge>
              {(() => {
                const status = getJobStatus(job);
                return (
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${status.statusColor}`}
                  >
                    {status.statusText}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 border-b pb-3">
          <Briefcase className="h-6 w-6 text-orange-600" />
          Kỹ năng yêu cầu
        </h3>
        <div className="flex flex-wrap gap-3">
          {job.skills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 border border-orange-100 transition-colors hover:bg-orange-100"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Job Description */}
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-gray-900 border-b pb-3">
          Mô tả công việc
        </h3>
        <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed">
          <RichTextPreview content={job.description} />
        </div>
      </div>
    </div>
  );
};

export default JobSection;
