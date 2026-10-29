import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { formatDate, getTodayString } from "../lib/utils";

export const DateFilterPopover = ({
  selectedDate,
  onDateChange,
  isActive,
  onSelectAllTime,
  size = "md"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dateInputRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    // If not active, switch to all/custom tab and open popover
    if (!isActive) {
      onSelectAllTime();
    }
    setIsOpen((prev) => !prev);
  };

  const handleDateSelect = (e) => {
    const val = e.target.value;
    if (val) {
      onDateChange(val);
      setIsOpen(false);
    }
  };

  const handleQuickPreset = (type) => {
    if (type === "all") {
      onDateChange("");
      onSelectAllTime();
      setIsOpen(false);
    } else if (type === "today") {
      onDateChange(getTodayString());
      setIsOpen(false);
    } else if (type === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      onDateChange(`${year}-${month}-${day}`);
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onDateChange("");
    onSelectAllTime();
  };

  const isCustomDate = Boolean(selectedDate);
  const isHighlighted = isActive || isCustomDate;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={`flex items-center gap-1.5 font-bold rounded-xl transition whitespace-nowrap ${
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs"
        } ${
          isHighlighted
            ? "bg-amber-400 text-[#0b3d2e] shadow-md"
            : "bg-[#18233c] text-slate-400 hover:text-white"
        }`}
        title="Filter by custom date or view all time"
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        <span>
          {isCustomDate ? formatDate(selectedDate) : "All Time"}
        </span>

        {isCustomDate ? (
          <span
            onClick={handleClear}
            className="ml-1 p-0.5 hover:bg-black/20 rounded-full transition"
            title="Clear date filter"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </span>
        ) : (
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Date
              </span>
            </div>
            {isCustomDate && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
              >
                Reset
              </button>
            )}
          </div>

          {/* Native Date Picker Input */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[11px] font-medium text-slate-400">
              Pick a specific date:
            </label>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate || ""}
              onChange={handleDateSelect}
              className="w-full bg-[#18233c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPreset("today")}
                className="px-2 py-1.5 bg-[#18233c] hover:bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white rounded-lg transition text-center"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("yesterday")}
                className="px-2 py-1.5 bg-[#18233c] hover:bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white rounded-lg transition text-center"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("all")}
                className="px-2 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-[11px] font-bold text-emerald-300 rounded-lg transition text-center"
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
