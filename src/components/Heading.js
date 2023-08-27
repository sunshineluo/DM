export default function Heading({ children, onClick, id }) {
  return (
    <h2
      id={id}
      onClick={onClick}
      className="transition-all duration-500 flex flex-row space-x-2 opacity-90 cursor-pointer hover:opacity-75 px-6 md:px-0 sm:px-0 font-medium text-xl md:text-2xl sm:text-3xl"
    >
      {children}
    </h2>
  );
}
