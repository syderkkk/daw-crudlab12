import Link from "next/link";
import { BookOpenIcon, ChevronLeftIcon, ArrowRightIcon } from "./icons";

interface NavProps {
  back?: { href: string; label?: string };
  action?: { href: string; label: string };
}

export function Nav({ back, action }: NavProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div>
          {back ? (
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              {back.label ?? "Back"}
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">Biblioteca</span>
            </div>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
          >
            {action.label}
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </header>
  );
}
