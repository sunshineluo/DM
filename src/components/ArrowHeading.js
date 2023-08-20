export default function ArrowHeading({ children, onClick, id }) {
  return (
    <h2
      id={id}
      onClick={onClick}
      className="flex flex-row space-x-2 opacity-90 cursor-pointer hover:opacity-75 px-6 md:px-0 sm:px-0 font-medium text-lg md:text-xl sm:text-2xl"
    >
      {children}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="mt-[0.225rem] md:mt-1 sm:mt-1"
        class="main-grid-item-icon"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </h2>
  );
}
