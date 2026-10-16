import styles from "./RokubarMark.module.css";

// The cross of a Roku d-pad, as on the remote replica.
const cross =
  "M -28 -104 H 28 A 24 24 0 0 1 52 -80 V -70 A 18 18 0 0 0 70 -52 H 80 A 24 24 0 0 1 104 -28 V 28 A 24 24 0 0 1 80 52 H 70 " +
  "A 18 18 0 0 0 52 70 V 80 A 24 24 0 0 1 28 104 H -28 A 24 24 0 0 1 -52 80 V 70 A 18 18 0 0 0 -70 52 H -80 A 24 24 0 0 1 -104 28 " +
  "V -28 A 24 24 0 0 1 -80 -52 H -70 A 18 18 0 0 0 -52 -70 V -80 A 24 24 0 0 1 -28 -104 Z";

/** Rokubar's mark at interface sizes, drawn from tray/icons/icon-small.svg: a remote sending a wave. */
export function RokubarMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 256 256" aria-hidden="true">
      <defs>
        <linearGradient id="mark-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a5a64" />
          <stop offset="0.45" stopColor="#2a2a30" />
          <stop offset="1" stopColor="#131316" />
        </linearGradient>
        <linearGradient id="mark-pad" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#a06cff" />
          <stop offset="1" stopColor="#5b1fd0" />
        </linearGradient>
        <linearGradient id="mark-tag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8d4dff" />
          <stop offset="1" stopColor="#5418c4" />
        </linearGradient>
        <linearGradient id="mark-wave" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#8b4cff" />
          <stop offset="1" stopColor="#c7a2ff" />
        </linearGradient>
      </defs>
      <g transform="translate(96 146) rotate(36) scale(0.92)">
        <path d="M -26 92 H 26 V 142 L 0 128 L -26 142 Z" fill="url(#mark-tag)" />
        <rect x="-54" y="-112" width="108" height="214" rx="54" fill="url(#mark-shell)" />
        <rect x="-54" y="-112" width="108" height="214" rx="54" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="8" />
        <circle cx="0" cy="-72" r="16" fill="#ff3b45" />
        <path d={cross} transform="translate(0 4) scale(0.46)" fill="url(#mark-pad)" />
        <circle cx="0" cy="4" r="13" fill="#4a16b0" />
      </g>
      <path d="M 162 18 A 52 52 0 0 1 206 76" fill="none" stroke="url(#mark-wave)" strokeLinecap="round" strokeWidth="28" />
    </svg>
  );
}
