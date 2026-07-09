import type { FC } from "react";
import type { PaginationMeta } from "../../types";

interface Props {
  meta:    PaginationMeta | null;
  onPage:  (page: number) => void;
  loading?: boolean;
}

export const Pagination: FC<Props> = ({ meta, onPage, loading }) => {
  if (!meta || meta.total === 0) return null;

  const { page, pages, total, limit } = meta;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <span className="text-xs text-gray-400">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1 || loading}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
                     text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <i className="ti ti-chevron-left text-base" aria-hidden="true" />
        </button>
        <span className="text-xs font-medium text-gray-600 px-2 tabular-nums">
          {page} / {pages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages || loading}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
                     text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <i className="ti ti-chevron-right text-base" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
