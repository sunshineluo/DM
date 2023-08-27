export default function ArrowHeading({ children, onClick, id }) {
  return (
    <h2
      id={id}
      onClick={onClick}
      className="transition-all duration-500 flex items-center space-x-2 opacity-90 cursor-pointer hover:opacity-75 px-6 md:px-0 sm:px-0 font-semibold text-xl md:text-2xl sm:text-3xl"
    >
      {children}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        style={{ verticalAlign: "middle" }} // 添加此样式，实现垂直居中对齐
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </h2>
  );
}
