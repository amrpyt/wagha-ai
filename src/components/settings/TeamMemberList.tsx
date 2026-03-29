'use client'

import type { FirmMember } from '@/types/database.types'

interface TeamMemberListProps {
  members: (FirmMember & { auth?: { users?: { email?: string } } })[]
}

export function TeamMemberList({ members }: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <p className="text-gray-500 text-right">لا يوجد أعضاء في الفريق</p>
    )
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {(member.auth?.users as { email?: string } | undefined)?.email || 'غير معروف'}
            </p>
            <p className="text-sm text-gray-500">
              {member.role === 'admin' ? 'مشرف' : 'عضو'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            member.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {member.role === 'admin' ? 'مشرف' : 'عضو'}
          </span>
        </div>
      ))}
    </div>
  )
}
