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
      className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-black/10 relative group transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
      onClick={onSelect}
    >
      {/* Header with colored background */}
      <div
        className="flex items-start p-4 sm:p-5 rounded-t-lg sm:rounded-t-xl relative"
        style={{ background: colors.bgcolor }}
      >
        {/* Enhanced Initials Circle */}
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg border-2 border-black/10">
          <span className="text-sm sm:text-lg font-black text-black">
            {getInitials(title)}
          </span>
        </div>

        {/* Title & Fitness Goal */}
        <div className="flex flex-col justify-start items-start flex-grow min-w-0">
          <h2 className="text-sm sm:text-base lg:text-lg font-black text-black truncate w-full uppercase tracking-wide">{title}</h2>
          {fitnessGoal && (
            <p className="text-xs sm:text-sm text-gray-800 mt-1 line-clamp-1 font-medium">{fitnessGoal}</p>
          )}
        </div>

        {/* Enhanced Delete Button */}
        <button
          className="hidden group-hover:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white font-bold bg-red-500 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 border-red-600 hover:bg-red-600 hover:border-red-700 cursor-pointer absolute top-2 right-2 transition-all duration-300 transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <LuTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* Enhanced Badges & Description */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 sm:pt-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm font-bold text-black px-3 sm:px-4 py-1 sm:py-2 border-2 border-black rounded-full bg-gray-100 hover:bg-black hover:text-white transition-all duration-300">
            Type: {planType}
          </div>

          <div className="text-xs sm:text-sm font-bold text-black px-3 sm:px-4 py-1 sm:py-2 border-2 border-black rounded-full bg-gray-100 hover:bg-black hover:text-white transition-all duration-300">
            Q: {questions}
          </div>

          <div className="text-xs sm:text-sm font-bold text-black px-3 sm:px-4 py-1 sm:py-2 border-2 border-black rounded-full bg-gray-100 hover:bg-black hover:text-white transition-all duration-300">
            {lastUpdated}
          </div>
        </div>

        {workoutAvailability && (
          <p className="text-xs sm:text-sm text-gray-600 font-medium line-clamp-2 mt-3 sm:mt-4 leading-relaxed">
            {workoutAvailability}
          </p>
        )}

        {/* Action Indicator */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Click to View Details
          </div>
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
