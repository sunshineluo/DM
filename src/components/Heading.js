export default function Heading({ children, onClick, id }) {
  return (
    <h2
      id={id}
      onClick={onClick}
      className="transition-all duration-500 flex flex-row space-x-2 opacity-90 cursor-pointer hover:opacity-75 px-6 md:px-0 sm:px-0 font-medium text-lg md:text-xl sm:text-2xl"
    >
      {children}
    </h2>
  );
}
