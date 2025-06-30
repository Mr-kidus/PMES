const Modal = ({ children, toggleForm, id }) => {
  return (
    <div
      className="fixed inset-0 bg-black/5 backdrop-blur-[4px] backdrop-brightness-80 transition-all duration-300 flex justify-center items-center z-50"
      onClick={() => toggleForm(id)}
    >
      <div
        className="rounded shadow-lg" // optional: styling for the modal box
        onClick={(e) => e.stopPropagation()} // this prevents modal from closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
