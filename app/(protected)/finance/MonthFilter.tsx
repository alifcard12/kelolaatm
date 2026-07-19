"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  shiftMonthKey,
  monthKeyLabel,
  currentJakartaMonthKey,
} from "@/lib/date";

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter();
  const prevMonth = shiftMonthKey(month, -1);
  const nextMonth = shiftMonthKey(month, 1);
  const isCurrent = month === currentJakartaMonthKey();

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <div className="flex items-center gap-2">
        <Link
          href={`/finance?month=${prevMonth}`}
          aria-label="Bulan sebelumnya"
          className="flex items-center justify-center h-10 w-10 rounded-xl border border-taupe-dark/60 bg-paper text-espresso-soft hover:bg-cream transition-colors"
        >
          <FiChevronLeft />
        </Link>

        <div className="relative">
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value)
                router.push(`/finance?month=${e.target.value}`);
            }}
            className="rounded-xl border border-taupe-dark/60 bg-paper px-3.5 py-2.5 text-sm text-espresso min-w-[9.5rem] focus:border-rose"
          />
        </div>

        <Link
          href={`/finance?month=${nextMonth}`}
          aria-label="Bulan berikutnya"
          className="flex items-center justify-center h-10 w-10 rounded-xl border border-taupe-dark/60 bg-paper text-espresso-soft hover:bg-cream transition-colors"
        >
          <FiChevronRight />
        </Link>
      </div>
      {!isCurrent && (
        <Link
          href={`/finance?month=${currentJakartaMonthKey()}`}
          className="text-xs font-medium text-cream px-2 py-1 rounded-md bg-rose hover:underline ml-1 flex items-center gap-1"
        >
          <FiCalendar />
          Bulan ini
        </Link>
      )}

      <span className="hidden sm:inline text-sm text-espresso-soft ml-1">
        {monthKeyLabel(month)}
      </span>
    </div>
  );
}
