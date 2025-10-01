import { LuPin, LuBookOpen } from "react-icons/lu";

const QuestionCard = ({
  question,
  answer,
  isPinned,
  onTogglePin,
  onLearnMore,
}) => {
  return (
    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative transition-all duration-300 transform hover:scale-[1.01] group">
      {/* Header with Question and Pin */}
      <div className="flex justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h4 className="font-black text-sm sm:text-base lg:text-lg text-black flex-1 leading-tight uppercase tracking-wide">{question}</h4>
        <button
          onClick={onTogglePin}
          className="p-2 sm:p-3 rounded-lg hover:bg-gray-100 transition-all duration-300 flex-shrink-0 border-2 border-gray-200 hover:border-gray-300 transform hover:scale-110"
          title={isPinned ? "Unpin this question" : "Pin this question"}
        >
          <LuPin
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
              isPinned ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"
            }`}
          />
        </button>
      </div>

      {/* Answer Content */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm lg:text-base text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
          {answer}
        </p>
      </div>

      {/* Action Button */}
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-wide transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <LuBookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> 
          <span>Learn More</span>
        </button>
      )}

      {/* Status Indicator */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
        <div className={`w-3 h-3 rounded-full ${isPinned ? 'bg-orange-500' : 'bg-gray-300'} animate-pulse`}></div>
      </div>
    </div>
  );
};

export default QuestionCard;
