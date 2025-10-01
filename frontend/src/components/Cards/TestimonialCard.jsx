const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="border-2 border-black bg-white text-black">
      {testimonial.imageURL && (
        <img src={testimonial.imageURL} alt="Testimonial" className="w-full h-48 object-cover border-b-2 border-black" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black uppercase tracking-wide">{testimonial.userName}</h3>
          <span className="text-xs font-black">{testimonial.rating}/5</span>
        </div>
        <div className="text-xs font-bold text-gray-600 mb-3">{testimonial.userRole}</div>
        <p className="font-medium">{testimonial.message}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;