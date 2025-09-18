import { LuPin, LuBookOpen } from "react-icons/lu";

const QuestionCard = ({
  question,
  answer,
  isPinned,
  onTogglePin,
  onLearnMore,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4 relative">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-lg">{question}</h4>
        <button
          onClick={onTogglePin}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LuPin
            className={`text-xl ${
              isPinned ? "text-orange-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-wrap">
        {answer}
      </p>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <LuBookOpen /> Learn More
        </button>
      )}
    </div>
  );
};

export default QuestionCard;
