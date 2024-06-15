const noCover = `<svg width="399" height="138" viewBox="0 0 399 138" fill="none" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <a id="redirect" href="{{ newRedirectUrl }}">
        <g id="Frame 11">
            <rect  width="399" height="138" rx="9" fill="url(#pattern0)" />
            <g filter="url(#filter0_d_9_22)">
                <text id="stars" fill="{{ starsColor }}" xml:space="preserve" style="white-space: pre" font-family="Inter"
                    font-size="32" letter-spacing="0em"><tspan x="11" y="121.636">&#x2605;&#x2605;&#x2605;&#x2605;</tspan></text>
            </g>
            <text id="title" fill="{{ titleColor }}" xml:space="preserve" style="white-space: pre"
                font-family="Inter" font-size="27" letter-spacing="0em"><tspan x="11" y="46.3182">{{ title }}</tspan></text>
            <text id="date" fill="{{ dateColor }}" fill-opacity="0.65" xml:space="preserve"
                style="white-space: pre" font-family="Inter" font-size="16" letter-spacing="0em"><tspan x="11" y="68.3182">{{ date }}</tspan></text>
            <text id="ago" fill="{{ agoColor }}" fill-opacity="0.65" xml:space="preserve"
                style="white-space: pre" font-family="Inter" font-size="15" letter-spacing="0em"><tspan x="360.083" y="116.955">{{ ago }}</tspan></text>
        </g>
        <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#background_image"
                    transform="matrix(0.00277778 0 0 0.00724638 0 -0.144928)" />
            </pattern>
            <filter id="filter0_d_9_22" x="3.90918" y="85.8182" width="148.042" height="46.4091"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset />
                <feGaussianBlur stdDeviation="5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9_22" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9_22"
                    result="shape" />
            </filter>
            {{ background }}
        </defs>
    </a>
</svg>`;

module.exports = { noCover };
