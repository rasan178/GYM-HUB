const PlanCard = ({ plan }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{plan.planName}</h2>
        <p>Description: {plan.description}</p>
        <p>Price: ${plan.price}</p>
        <p>Duration: {plan.durationMonths} months</p>
      </div>
    </div>
  );
};

export default PlanCard;