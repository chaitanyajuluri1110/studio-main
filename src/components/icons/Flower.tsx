export function SlsCenterLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="256" cy="256" r="250" fill="#FFF8E1" />
      <circle cx="256" cy="256" r="250" stroke="#B8860B" strokeWidth="12" />
      <path
        d="M128 256C128 326.42 185.58 384 256 384C326.42 384 384 326.42 384 256"
        stroke="#B8860B"
        strokeWidth="8"
      />
      <text
        x="256"
        y="160"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="54"
        fill="#4A2311"
        textAnchor="middle"
        letterSpacing="2"
        fontWeight="bold"
      >
        SRI LAKSHMI
      </text>
      <text
        x="256"
        y="430"
        fontFamily="Inter, sans-serif"
        fontSize="36"
        fill="#4A2311"
        textAnchor="middle"
        letterSpacing="1"
      >
        SAREE CENTER
      </text>
      <path
        d="M256 200 C 220 240, 220 290, 256 330 C 292 290, 292 240, 256 200 Z"
        fill="#B8860B"
      />
      <path
        d="M256 220 C 240 250, 240 280, 256 310 C 272 280, 272 250, 256 220 Z"
        fill="#FFF8E1"
      />
    </svg>
  );
}
