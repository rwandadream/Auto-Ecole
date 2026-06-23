import { useState } from 'react'

export function usePagination<T>(items: T[], perPage = 8) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * perPage
  const pageItems = items.slice(debut, debut + perPage)

  return { page: pageCourante, setPage, totalPages, pageItems, debut }
}
