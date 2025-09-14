const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure><img src={testimonial.imageURL || '/images/default-testimonial.png'} alt="Testimonial" className="w-full h-48 object-cover" /></figure>
      <div className="card-body">
        <h2 className="card-title">{testimonial.userName}</h2>
        <p>{testimonial.userRole}</p>
        <p>{testimonial.message}</p>
        <p>Rating: {testimonial.rating}/5</p>
      </div>
    </div>
  );
};

export default TestimonialCard;