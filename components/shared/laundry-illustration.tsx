import * as React from "react";

const palette = {
  base: "#F5F1EC",
  cream: "#EDE6DD",
  beige: "#E0D6C8",
  clay: "#D0C0AC",
  taupe: "#BEA892",
  earth: "#A08B74",
  deep: "#7A6B58",
  warm: "#C4B09A",
};

export function LaundryIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1440 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <title>Laundry Lane</title>

      {/* Background base */}
      <rect width="1440" height="400" fill={palette.base} />

      {/* Deep fabric layer — flowing organic base shapes */}
      <path
        d="M0 340C120 280 240 360 380 310S580 240 720 290S920 370 1100 320S1320 250 1440 280V400H0V340Z"
        fill={palette.beige}
        opacity="0.6"
      />
      <path
        d="M0 360C180 310 320 260 500 320S740 280 900 340S1100 380 1300 330S1400 290 1440 300V400H0V360Z"
        fill={palette.cream}
        opacity="0.7"
      />
      <path
        d="M0 380C200 340 400 370 600 340S900 320 1100 350S1300 380 1440 360V400H0V380Z"
        fill={palette.clay}
        opacity="0.3"
      />

      {/* Stack 1 — left, medium */}
      <g>
        <rect x="100" y="290" width="80" height="110" rx="6" fill={palette.cream} />
        <rect x="105" y="304" width="72" height="96" rx="5" fill={palette.beige} />
        <rect x="110" y="318" width="64" height="82" rx="5" fill={palette.clay} />
        {/* Fold lines */}
        <line x1="110" y1="340" x2="174" y2="340" stroke={palette.taupe} strokeWidth="0.5" opacity="0.4" />
        <line x1="110" y1="362" x2="174" y2="362" stroke={palette.taupe} strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Fabric drape from stack 1 to washer */}
      <path
        d="M180 340C210 330 235 320 260 325"
        stroke={palette.taupe}
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />

      {/* Washing machine — center hero */}
      <g>
        <rect x="260" y="250" width="110" height="145" rx="11" fill={palette.cream} />
        <rect x="263" y="253" width="104" height="139" rx="10" fill={palette.beige} />
        <rect x="266" y="256" width="98" height="22" rx="5" fill={palette.clay} />
        <circle cx="285" cy="267" r="6" fill={palette.cream} />
        <circle cx="285" cy="267" r="4" fill={palette.taupe} />
        <rect x="328" y="261" width="28" height="12" rx="2" fill={palette.earth} opacity="0.25" />
        <rect x="331" y="264" width="22" height="6" rx="1" fill={palette.deep} opacity="0.15" />
        <circle cx="315" cy="330" r="38" fill={palette.clay} opacity="0.1" />
        <circle cx="315" cy="330" r="38" fill="none" stroke={palette.taupe} strokeWidth="2" />
        <circle cx="315" cy="330" r="32" fill={palette.clay} opacity="0.18" />
        <path d="M285 338 A30 30 0 0 0 345 338 Z" fill={palette.earth} opacity="0.18" />
        <circle cx="300" cy="346" r="3.5" fill={palette.cream} opacity="0.35" />
        <circle cx="318" cy="350" r="2.5" fill={palette.cream} opacity="0.3" />
        <circle cx="330" cy="344" r="3" fill={palette.cream} opacity="0.25" />
        <path d="M288 304 A32 32 0 0 1 338 304" fill={palette.cream} opacity="0.12" />
        <rect x="270" y="395" width="12" height="6" rx="2" fill={palette.taupe} />
        <rect x="348" y="395" width="12" height="6" rx="2" fill={palette.taupe} />
      </g>

      {/* Fabric drape from washer to stack 3 */}
      <path
        d="M370 345C410 325 445 335 480 340"
        stroke={palette.taupe}
        strokeWidth="1"
        fill="none"
        opacity="0.25"
      />

      {/* Stack 3 — middle-right, wide and medium */}
      <g>
        <rect x="480" y="300" width="140" height="100" rx="7" fill={palette.cream} />
        <rect x="485" y="312" width="130" height="88" rx="6" fill={palette.beige} />
        <rect x="490" y="328" width="120" height="72" rx="5" fill={palette.clay} />
        {/* Fold lines */}
        <line x1="490" y1="345" x2="610" y2="345" stroke={palette.taupe} strokeWidth="0.5" opacity="0.35" />
        <line x1="490" y1="365" x2="610" y2="365" stroke={palette.taupe} strokeWidth="0.5" opacity="0.35" />
      </g>

      {/* Fabric drape */}
      <path
        d="M620 350C660 320 700 340 740 360"
        stroke={palette.warm}
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />

      {/* Stack 4 — right, tall and narrow */}
      <g>
        <rect x="720" y="270" width="85" height="130" rx="7" fill={palette.cream} />
        <rect x="725" y="282" width="76" height="118" rx="6" fill={palette.beige} />
        <rect x="730" y="298" width="68" height="102" rx="5" fill={palette.clay} />
        <rect x="735" y="314" width="60" height="86" rx="5" fill={palette.taupe} />
        {/* Fold lines */}
        <line x1="730" y1="330" x2="796" y2="330" stroke={palette.earth} strokeWidth="0.5" opacity="0.3" />
        <line x1="730" y1="350" x2="796" y2="350" stroke={palette.earth} strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* Fabric drape */}
      <path
        d="M805 350C850 320 890 340 940 360"
        stroke={palette.taupe}
        strokeWidth="1"
        fill="none"
        opacity="0.25"
      />

      {/* Stack 5 — far right, small accent */}
      <g>
        <rect x="920" y="325" width="65" height="75" rx="5" fill={palette.cream} />
        <rect x="925" y="336" width="56" height="64" rx="4" fill={palette.beige} />
        <rect x="930" y="348" width="48" height="52" rx="4" fill={palette.clay} />
      </g>

      {/* Single folded piece — far right edge */}
      <rect x="1050" y="345" width="50" height="55" rx="4" fill={palette.beige} opacity="0.8" />
      <line x1="1050" y1="365" x2="1100" y2="365" stroke={palette.taupe} strokeWidth="0.5" opacity="0.3" />
      <rect x="1140" y="360" width="40" height="40" rx="3" fill={palette.clay} opacity="0.6" />

      {/* Decorative floating elements — like bubbles/steam */}
      <circle cx="180" cy="240" r="3" fill={palette.clay} opacity="0.4" />
      <circle cx="195" cy="220" r="2" fill={palette.taupe} opacity="0.3" />
      <circle cx="350" cy="200" r="4" fill={palette.clay} opacity="0.35" />
      <circle cx="370" cy="185" r="2.5" fill={palette.taupe} opacity="0.25" />
      <circle cx="550" cy="250" r="3" fill={palette.clay} opacity="0.3" />
      <circle cx="780" cy="230" r="3.5" fill={palette.taupe} opacity="0.3" />
      <circle cx="800" cy="215" r="2" fill={palette.clay} opacity="0.25" />
      <circle cx="980" cy="280" r="2.5" fill={palette.taupe} opacity="0.25" />
      <circle cx="1100" cy="310" r="2" fill={palette.clay} opacity="0.2" />

      {/* Subtle grain/noise overlay */}
      <rect width="1440" height="400" fill="url(#grain)" opacity="0.04" />
      <defs>
        <pattern id="grain" width="128" height="128" patternUnits="userSpaceOnUse">
          <rect width="128" height="128" fill="transparent" />
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="128" height="128" filter="url(#noise)" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

export function LaundryIllustrationTall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 960 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <title>Laundry Lane</title>

      <rect width="960" height="1080" fill={palette.base} />

      {/* Deep flowing fabric layers */}
      <path
        d="M0 200C200 80 400 250 600 180S800 350 960 280V1080H0V200Z"
        fill={palette.beige}
        opacity="0.4"
      />
      <path
        d="M0 450C300 300 500 500 700 400S850 600 960 550V1080H0V450Z"
        fill={palette.cream}
        opacity="0.5"
      />
      <path
        d="M0 680C250 550 450 700 650 620S800 800 960 750V1080H0V680Z"
        fill={palette.clay}
        opacity="0.3"
      />
      <path
        d="M0 850C350 750 550 900 750 820S880 950 960 920V1080H0V850Z"
        fill={palette.taupe}
        opacity="0.15"
      />

      {/* Draped fabric — organic flowing cloth shapes */}
      <path
        d="M120 400C200 340 280 420 360 380S480 300 560 370S680 460 760 400S860 340 920 380V500C820 460 720 540 620 480S480 360 380 440S240 520 120 460V400Z"
        fill={palette.warm}
        opacity="0.15"
      />
      <path
        d="M80 700C180 640 280 720 380 680S520 580 620 650S740 760 840 700S900 660 960 680V800C860 760 760 840 660 780S520 660 420 740S260 820 160 760S100 740 80 700Z"
        fill={palette.earth}
        opacity="0.1"
      />

      {/* Stack 1 — left */}
      <g>
        <rect x="120" y="520" width="100" height="110" rx="7" fill={palette.cream} />
        <rect x="125" y="535" width="92" height="97" rx="6" fill={palette.beige} />
        <rect x="130" y="552" width="84" height="82" rx="5" fill={palette.clay} />
        <rect x="135" y="570" width="76" height="66" rx="5" fill={palette.taupe} />
        <line x1="130" y1="580" x2="214" y2="580" stroke={palette.deep} strokeWidth="0.6" opacity="0.2" />
        <line x1="130" y1="600" x2="214" y2="600" stroke={palette.deep} strokeWidth="0.6" opacity="0.2" />
      </g>

      {/* Fabric drape 1→2 */}
      <path
        d="M220 550C280 530 320 490 370 500"
        stroke={palette.taupe}
        strokeWidth="1"
        fill="none"
        opacity="0.25"
      />

      {/* Washing machine — center hero */}
      <g>
        <rect x="370" y="410" width="140" height="180" rx="14" fill={palette.cream} />
        <rect x="374" y="414" width="132" height="172" rx="12" fill={palette.beige} />
        <rect x="378" y="418" width="124" height="26" rx="6" fill={palette.clay} />
        <circle cx="400" cy="431" r="8" fill={palette.cream} />
        <circle cx="400" cy="431" r="5" fill={palette.taupe} />
        <circle cx="400" cy="431" r="1.5" fill={palette.deep} opacity="0.3" />
        <circle cx="428" cy="431" r="5" fill={palette.cream} />
        <circle cx="428" cy="431" r="3" fill={palette.clay} />
        <rect x="452" y="424" width="36" height="14" rx="2" fill={palette.earth} opacity="0.25" />
        <rect x="456" y="428" width="28" height="6" rx="1" fill={palette.deep} opacity="0.15" />
        <circle cx="440" cy="510" r="50" fill={palette.clay} opacity="0.12" />
        <circle cx="440" cy="510" r="50" fill="none" stroke={palette.taupe} strokeWidth="2.5" />
        <circle cx="440" cy="510" r="42" fill={palette.clay} opacity="0.18" />
        <circle cx="440" cy="510" r="42" fill="none" stroke={palette.taupe} strokeWidth="0.8" opacity="0.25" />
        <path d="M402 520 A38 38 0 0 0 478 520 Z" fill={palette.earth} opacity="0.18" />
        <circle cx="420" cy="530" r="4.5" fill={palette.cream} opacity="0.35" />
        <circle cx="438" cy="535" r="3" fill={palette.cream} opacity="0.3" />
        <circle cx="452" cy="528" r="3.5" fill={palette.cream} opacity="0.25" />
        <circle cx="430" cy="522" r="2" fill={palette.cream} opacity="0.2" />
        <circle cx="458" cy="538" r="2.5" fill={palette.cream} opacity="0.2" />
        <path d="M406 478 A42 42 0 0 1 464 478" fill={palette.cream} opacity="0.12" />
        <path d="M414 484 A34 34 0 0 1 456 484" fill={palette.cream} opacity="0.08" />
        <rect x="384" y="590" width="14" height="8" rx="3" fill={palette.taupe} />
        <rect x="482" y="590" width="14" height="8" rx="3" fill={palette.taupe} />
      </g>

      {/* Fabric drape 2→3 */}
      <path
        d="M510 500C560 480 600 510 640 530"
        stroke={palette.taupe}
        strokeWidth="1.2"
        fill="none"
        opacity="0.2"
      />

      {/* Stack 3 — right */}
      <g>
        <rect x="650" y="490" width="95" height="140" rx="6" fill={palette.cream} />
        <rect x="655" y="505" width="86" height="125" rx="5" fill={palette.beige} />
        <rect x="660" y="522" width="78" height="108" rx="5" fill={palette.clay} />
        <rect x="665" y="540" width="70" height="90" rx="4" fill={palette.taupe} />
        <line x1="660" y1="555" x2="738" y2="555" stroke={palette.deep} strokeWidth="0.6" opacity="0.2" />
        <line x1="660" y1="580" x2="738" y2="580" stroke={palette.deep} strokeWidth="0.6" opacity="0.2" />
      </g>

      {/* Fabric drape 3→ edge */}
      <path
        d="M745 560C800 530 850 560 900 580"
        stroke={palette.warm}
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />

      {/* Small accent stack — bottom right */}
      <g>
        <rect x="800" y="680" width="70" height="80" rx="5" fill={palette.beige} opacity="0.7" />
        <rect x="805" y="692" width="60" height="68" rx="4" fill={palette.clay} opacity="0.7" />
        <line x1="805" y1="720" x2="865" y2="720" stroke={palette.taupe} strokeWidth="0.5" opacity="0.25" />
      </g>

      {/* Single folded accents */}
      <rect x="70" y="720" width="60" height="65" rx="4" fill={palette.clay} opacity="0.5" />
      <rect x="880" y="790" width="45" height="50" rx="3" fill={palette.taupe} opacity="0.3" />

      {/* Floating dots — steam/bubbles */}
      <circle cx="200" cy="420" r="3.5" fill={palette.clay} opacity="0.35" />
      <circle cx="220" cy="390" r="2" fill={palette.taupe} opacity="0.25" />
      <circle cx="450" cy="300" r="4" fill={palette.clay} opacity="0.3" />
      <circle cx="470" cy="280" r="2.5" fill={palette.taupe} opacity="0.2" />
      <circle cx="680" cy="410" r="3" fill={palette.clay} opacity="0.3" />
      <circle cx="700" cy="390" r="1.5" fill={palette.taupe} opacity="0.2" />
      <circle cx="340" cy="680" r="2.5" fill={palette.clay} opacity="0.25" />
      <circle cx="600" cy="720" r="2" fill={palette.taupe} opacity="0.2" />
      <circle cx="150" cy="300" r="3" fill={palette.beige} opacity="0.3" />
      <circle cx="820" cy="320" r="2" fill={palette.clay} opacity="0.2" />
      <circle cx="520" cy="700" r="3" fill={palette.taupe} opacity="0.15" />
      <circle cx="110" cy="850" r="2" fill={palette.clay} opacity="0.15" />

      {/* Grain texture */}
      <rect width="960" height="1080" fill="url(#grainT)" opacity="0.04" />
      <defs>
        <pattern id="grainT" width="128" height="128" patternUnits="userSpaceOnUse">
          <rect width="128" height="128" fill="transparent" />
          <filter id="noiseT">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="128" height="128" filter="url(#noiseT)" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

export function LaundryIllustrationMobile(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 390 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <title>Laundry Lane</title>

      <rect width="390" height="200" fill={palette.base} />

      {/* Flowing base */}
      <path
        d="M0 160C60 130 120 150 180 130S260 120 320 140S370 160 390 150V200H0V160Z"
        fill={palette.beige}
        opacity="0.5"
      />
      <path
        d="M0 180C80 155 140 170 220 155S310 165 390 175V200H0V180Z"
        fill={palette.cream}
        opacity="0.6"
      />

      {/* Stack — left */}
      <g>
        <rect x="30" y="145" width="50" height="55" rx="4" fill={palette.cream} />
        <rect x="35" y="154" width="42" height="46" rx="3" fill={palette.beige} />
      </g>

      {/* Fabric drape */}
      <path
        d="M80 170C90 158 98 150 105 155"
        stroke={palette.taupe}
        strokeWidth="0.8"
        fill="none"
        opacity="0.3"
      />

      {/* Washing machine — center */}
      <g>
        <rect x="105" y="122" width="70" height="72" rx="7" fill={palette.cream} />
        <rect x="107" y="124" width="66" height="68" rx="6" fill={palette.beige} />
        <rect x="109" y="126" width="62" height="14" rx="3" fill={palette.clay} />
        <circle cx="122" cy="133" r="4" fill={palette.cream} />
        <circle cx="122" cy="133" r="2.5" fill={palette.taupe} />
        <circle cx="140" cy="162" r="22" fill={palette.clay} opacity="0.1" />
        <circle cx="140" cy="162" r="22" fill="none" stroke={palette.taupe} strokeWidth="1.5" />
        <circle cx="140" cy="162" r="18" fill={palette.clay} opacity="0.18" />
        <path d="M124 168 A16 16 0 0 0 156 168 Z" fill={palette.earth} opacity="0.18" />
        <circle cx="132" cy="174" r="2" fill={palette.cream} opacity="0.35" />
        <circle cx="145" cy="176" r="1.5" fill={palette.cream} opacity="0.3" />
        <path d="M126 148 A18 18 0 0 1 152 148" fill={palette.cream} opacity="0.12" />
        <rect x="112" y="194" width="8" height="4" rx="1.5" fill={palette.taupe} />
        <rect x="160" y="194" width="8" height="4" rx="1.5" fill={palette.taupe} />
      </g>

      {/* Fabric drape */}
      <path
        d="M175 158C200 146 225 150 250 158"
        stroke={palette.warm}
        strokeWidth="0.8"
        fill="none"
        opacity="0.25"
      />

      {/* Stack — right */}
      <g>
        <rect x="250" y="135" width="55" height="65" rx="4" fill={palette.cream} />
        <rect x="255" y="145" width="46" height="55" rx="3" fill={palette.clay} />
        <line x1="255" y1="165" x2="301" y2="165" stroke={palette.taupe} strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* Accent */}
      <rect x="335" y="160" width="35" height="40" rx="3" fill={palette.beige} opacity="0.6" />

      {/* Floating dots */}
      <circle cx="150" cy="100" r="2.5" fill={palette.clay} opacity="0.3" />
      <circle cx="280" cy="110" r="2" fill={palette.taupe} opacity="0.25" />
      <circle cx="80" cy="120" r="1.5" fill={palette.clay} opacity="0.2" />

      <rect width="390" height="200" fill="url(#grainM)" opacity="0.04" />
      <defs>
        <pattern id="grainM" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="transparent" />
          <filter id="noiseM">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="64" height="64" filter="url(#noiseM)" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}
