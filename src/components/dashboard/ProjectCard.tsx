'use client'

import Link from 'next/link'
import type { Project } from '@/types/database.types'

interface ProjectCardProps {
  project: Project
}

const statusLabels: Record<string, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'قيد الانتظار', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  processing: { label: 'قيد المعالجة', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  complete: { label: 'مكتمل', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  failed: { label: 'فشل', bgColor: 'bg-red-100', textColor: 'text-red-800' },
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusLabels[project.status] || statusLabels.pending

  // Format date in Arabic - Western numerals
  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(project.created_at))

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* Thumbnail area */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
          {project.render_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.render_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Status badge - top-left in RTL (which is right visually) */}
          <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
            {status.label}
          </span>
        </div>

        {/* Card content */}
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-gray-900 text-right mb-1 line-clamp-1">
            {project.name}
          </h3>
          {project.project_number && (
            <p className="text-sm text-gray-500 text-right">
              #{project.project_number}
            </p>
          )}
          <p className="text-xs text-gray-400 text-right mt-2">
            {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}
