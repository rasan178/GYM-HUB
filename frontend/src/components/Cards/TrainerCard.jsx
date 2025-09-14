const TrainerCard = ({ trainer }) => {
  // safely handle specialty
  const specialtyText = Array.isArray(trainer.specialty)
    ? trainer.specialty.join(', ')
    : trainer.specialty || "Not specified";

  return (
    <div className="card w-full md:w-96 bg-base-100 shadow-xl">
      <figure>
        <img
          src={trainer.image || '/images/default-trainer.png'}
          alt={trainer.trainerName}
          className="w-full h-48 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{trainer.trainerName}</h2>
        <p>Email: {trainer.email}</p>
        <p>Specialty: {specialtyText}</p>
        <p>Experience: {trainer.experience}</p>
        <p>Qualifications: {trainer.qualifications}</p>
        <p>Bio: {trainer.bio}</p>
        <p>Status: {trainer.status}</p>
        <p>Phone: {trainer?.contactInfo?.phone || "N/A"}</p>
        <p>Address: {trainer?.contactInfo?.address || "N/A"}</p>
        <p>
          Social: FB {trainer?.socialLinks?.facebook || "N/A"}, IG{" "}
          {trainer?.socialLinks?.instagram || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default TrainerCard;
