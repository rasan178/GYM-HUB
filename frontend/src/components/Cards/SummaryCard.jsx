import React from 'react';
import { LuTrash2 } from "react-icons/lu";
import { getInitials } from '../../utils/helpers';

const SummaryCard = ({
  colors,
  title,
  fitnessGoal,
  planType,
  questions,
  workoutAvailability,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className="bg-white border border-gray-300/40 rounded-xl p-2 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-gray-100 relative group"
      onClick={onSelect}
    >
      {/* Header with colored background */}
      <div
        className="flex items-start p-4 rounded-t-lg relative"
        style={{ background: colors.bgcolor }}
      >
        {/* Initials Circle */}
        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4">
          <span className="text-lg font-semibold text-black">
            {getInitials(title)}
          </span>
        </div>

        {/* Title & Fitness Goal */}
        <div className="flex flex-col justify-start items-start flex-grow">
          <h2 className="text-[17px] font-medium text-black">{title}</h2>
          {fitnessGoal && (
            <p className="text-xs text-gray-900 mt-1">{fitnessGoal}</p>
          )}
        </div>

        {/* Delete Button */}
        <button
          className="hidden group-hover:flex items-center gap-2 text-xm text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded border border-rose-100 hover:border-rose-200 cursor-pointer absolute top-0 right-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <LuTrash2 />
        </button>
      </div>

      {/* Badges & Description */}
      <div className="px-3 pb-3 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Type: {planType}
          </div>

          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Questions: {questions}
          </div>

          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Last Updated: {lastUpdated}
          </div>
        </div>

        {workoutAvailability && (
          <p className="text-[12px] text-gray-500 font-medium line-clamp-2 mt-3">
            {workoutAvailability}
          </p>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
