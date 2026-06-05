import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';

export const PAGE_SIZE = 10;

interface PaginationProps {
  page: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalItems, itemLabel, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E0BDAA] px-5 py-4 text-xs font-semibold text-[#4B3024] sm:flex-row">
      <p>
        {totalItems === 0 ? (
          <>Mostrando 0 {itemLabel}</>
        ) : (
          <>
            Mostrando <span className="font-extrabold">{start}</span> a{' '}
            <span className="font-extrabold">{end}</span> de{' '}
            <span className="font-extrabold">{totalItems}</span> {itemLabel}
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        <PaginationButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          ariaLabel="Pagina anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>

        {pages.slice(0, 5).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`grid h-9 min-w-9 place-items-center rounded-[10px] px-3 text-xs font-extrabold transition ${
              pageNumber === currentPage
                ? 'bg-[#A83B00] text-white shadow-[0_10px_18px_rgba(168,59,0,0.18)]'
                : 'text-[#6B625C] hover:bg-[#FFF2E7]'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {totalPages > 5 && <span className="px-1 text-xs font-bold text-[#8A7F78]">...</span>}

        <PaginationButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          ariaLabel="Pagina siguiente"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-[#6B625C] transition hover:bg-[#FFF2E7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
