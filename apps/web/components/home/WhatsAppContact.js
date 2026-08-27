'use client'
import { useState } from 'react'

export function WhatsAppContact() {
  const [isHovered, setIsHovered] = useState(false)
  const whatsappNumber = '+971509379212'
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`

  return (
    <div
      className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 flex justify-center items-center gap-3 hover:from-green-600 hover:to-green-700 transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(whatsappLink, '_blank')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          window.open(whatsappLink, '_blank')
        }
      }}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.127 7.738L3.565 21.29l8.09-2.122c2.248 1.227 4.766 1.871 7.393 1.871 5.408 0 9.858-4.438 9.888-9.888.01-2.647-.522-5.23-1.54-7.622-1.019-2.392-2.497-4.546-4.289-6.322-1.793-1.777-3.942-3.162-6.356-4.047C12.36.723 9.676.35 7.05.358z"/>
      </svg>

      <div className="flex flex-col gap-0">
        <span className="text-xs font-semibold">Message us on WhatsApp</span>
        <span className="text-sm font-bold">{whatsappNumber}</span>
      </div>

      {isHovered && (
        <svg className="w-4 h-4 ml-2 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  )
}

export default WhatsAppContact
