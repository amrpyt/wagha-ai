import { notFound } from 'next/navigation'
import { getProject } from '@/lib/actions/projects'
import Link from 'next/link'
import { DeleteProjectModal } from '@/components/dashboard/DeleteProjectModal'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  // Format date - Western Arabic numerals
  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(project.created_at))

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    complete: 'مكتمل',
    failed: 'فشل',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    complete: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A5F]">
          لوحة التحكم
        </Link>
        <span>/</span>
        <span className="text-gray-900">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 text-right">
              {project.name}
            </h1>
            {project.project_number && (
              <p className="text-gray-500 text-right mt-1">
                #{project.project_number}
              </p>
            )}
            <p className="text-sm text-gray-400 text-right mt-2">
              {formattedDate}
            </p>
          </div>

          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status] || statusColors.pending}`}>
            {statusLabels[project.status] || project.status}
          </span>
        </div>

        {/* Render preview */}
        {project.render_url ? (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.render_url}
              alt={project.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">
              {project.status === 'processing' ? 'جاري معالجة التصميم...' : 'لم يتم إنشاء العرض بعد'}
            </p>
          </div>
        )}

        {/* Error message */}
        {project.status === 'failed' && project.error_message && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-right">
              {project.error_message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          {project.status === 'complete' && (
            <>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                تحميل JPG
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                تحميل PDF
              </button>
            </>
          )}

          <DeleteProjectModal projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-[#1E3A5F] hover:underline flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        العودة إلى لوحة التحكم
      </Link>
    </div>
  )
}
