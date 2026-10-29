import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X, ChevronDown, Check } from "lucide-react";
import { formatDate, getTodayString } from "../lib/utils";

export const DateFilterPopover = ({
  selectedDate,
  onDateChange,
  isActive,
  onSelectAllTime,
  size = "md"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputDate, setInputDate] = useState(selectedDate || "");
  const containerRef = useRef(null);
  const dateInputRef = useRef(null);

  // Sync internal input when selectedDate prop changes or popover opens
  useEffect(() => {
    setInputDate(selectedDate || "");
  }, [selectedDate, isOpen]);

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
    if (!isActive) {
      onSelectAllTime();
    }
    setIsOpen((prev) => !prev);
  };

  const isValidCompleteDate = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return false;
    const [year, month, day] = parts;
    if (year.length !== 4) return false;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    return y >= 2000 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
  };

  const handleApply = (dateToApply = inputDate) => {
    if (!dateToApply) {
      onDateChange("");
      onSelectAllTime();
      setIsOpen(false);
      return;
    }

    if (!isValidCompleteDate(dateToApply)) {
      return;
    }

    onDateChange(dateToApply);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputDate(val);

    // If user selected a complete valid date (e.g. from calendar widget)
    // update parent so preview updates, but DO NOT close the popover while typing!
    if (isValidCompleteDate(val)) {
      onDateChange(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply(inputDate);
    }
  };

  const handleQuickPreset = (type) => {
    if (type === "all") {
      setInputDate("");
      onDateChange("");
      onSelectAllTime();
      setIsOpen(false);
    } else if (type === "today") {
      const today = getTodayString();
      setInputDate(today);
      onDateChange(today);
      setIsOpen(false);
    } else if (type === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      setInputDate(dateStr);
      onDateChange(dateStr);
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputDate("");
    onDateChange("");
    onSelectAllTime();
  };

  const isCustomDate = Boolean(selectedDate && isValidCompleteDate(selectedDate));
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
        <div className="absolute left-0 mt-2 w-80 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
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

          {/* Native Date Picker Input + Apply Button */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[11px] font-medium text-slate-400">
              Pick or enter date:
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={dateInputRef}
                type="date"
                value={inputDate || ""}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[#18233c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400 transition cursor-pointer [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => handleApply(inputDate)}
                disabled={!isValidCompleteDate(inputDate) && Boolean(inputDate)}
                className={`px-3 py-2 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 ${
                  isValidCompleteDate(inputDate) || !inputDate
                    ? "bg-amber-400 hover:bg-amber-300 text-[#0b3d2e]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
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
