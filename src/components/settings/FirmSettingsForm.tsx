'use client'

import { useState, useTransition, useRef } from 'react'
import { updateFirm, uploadLogo } from '@/lib/actions/settings'

type SettingsState = { success?: boolean; error?: string }

export function FirmSettingsForm({
  firm,
}: {
  firm: { name: string; logo_url: string | null; brand_color: string }
}) {
  const [state, setState] = useState<SettingsState | undefined>()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState(firm.logo_url)
  const [isUploading, setIsUploading] = useState(false)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const result = await uploadLogo(file)

    if (result.success && result.url) {
      setLogoUrl(result.url)
      // Update firm with new logo URL
      const formData = new FormData()
      formData.append('logoUrl', result.url)
      formData.append('name', firm.name)
      formData.append('brandColor', firm.brand_color)
      startTransition(async () => {
        const updateResult = await updateFirm(state, formData)
        setState(updateResult)
      })
    } else if (result.error) {
      setState({ error: result.error })
    }

    setIsUploading(false)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateFirm(state, formData)
      setState(result)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 text-right mb-2">
          شعار الشركة
        </label>
        <div className="flex items-center gap-4 mt-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="شعار الشركة"
              className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">لا يوجد شعار</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? 'جاري الرفع...' : 'رفع شعار جديد'}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-right mt-2">
          PNG أو JPG، حجم أقل من 2 ميجابايت
        </p>
      </div>

      {/* Firm Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-2">
          اسم الشركة
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={firm.name}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
        />
      </div>

      {/* Brand Color */}
      <div>
        <label htmlFor="brandColor" className="block text-sm font-medium text-gray-700 text-right mb-2">
          اللون الأساسي
        </label>
        <div className="flex items-center gap-3">
          <input
            id="brandColor"
            name="brandColor"
            type="color"
            defaultValue={firm.brand_color}
            className="w-12 h-10 cursor-pointer border border-gray-200 rounded"
          />
          <input
            type="text"
            defaultValue={firm.brand_color}
            className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-left"
            dir="ltr"
            readOnly
          />
        </div>
        <p className="text-xs text-gray-500 text-right mt-2">
          يستخدم هذا اللون في الواجهة
        </p>
      </div>

      {state?.error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg">
          <p className="text-sm text-red-700 text-right">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 border-r-4 border-green-500 p-3 rounded-lg">
          <p className="text-sm text-green-700 text-right">تم حفظ التغييرات بنجاح</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 cursor-pointer transition-colors"
          style={{ backgroundColor: '#1E3A5F' }}
        >
          {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  )
}
