import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export const DateRangeFilter = ({ onFilter }) => {
  const { t } = useTranslation("layout");

  const initialRange = [
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ];

  const [range, setRange] = useState(initialRange);
  const [open, setOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = (ranges) => {
    const from = ranges.selection.startDate.toISOString();
    const to = ranges.selection.endDate.toISOString();
    setRange([ranges.selection]);
    setIsSelected(true);
    onFilter({ from, to });
  };

  const handleClear = () => {
    setRange(initialRange);
    setIsSelected(false);
    onFilter({ from: "", to: "" });
  };

  return (
    <div className="my-auto">
      <div className="relative">
        <input
          readOnly
          value={
            isSelected
              ? `${format(range[0].startDate, "yyyy-MM-dd")} — ${format(
                  range[0].endDate,
                  "yyyy-MM-dd"
                )}`
              : ""
          }
          onClick={() => setOpen(!open)}
          className="input input-bordered w-full cursor-pointer"
          placeholder={t("select_to_filter")}
        />
        {isSelected && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            &#10005;
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 shadow-lg bg-white border rounded-lg">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={range}
            showDateDisplay={false}
            showSelectionPreview={true}
            showPreview={false}
          />
        </div>
      )}
    </div>
  );
};
