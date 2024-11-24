const source = `
<svg width="399" height="138" viewBox="0 0 399 138" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <style>
        #title, #stars, #date, #ago {
            font-family: Inter;
            letter-spacing: 0em;
            white-space: pre;
        }

        #title {
            font-size: 27px;
        }

        #stars {
            font-size: 32px;
        }

        #date {
            font-size: 16px;
            fill-opacity: 0.65;
        }

        #ago {
            font-size: 15px;
            fill-opacity: 0.65;
        }

        text {
            fill: #FFFFFF;
            font-family: TiemposTextWeb-Semibold,Georgia,serif;
        }
    </style>
    <a id="redirect">
        <g id="main">
<path id="background" d="M0 9C0 4.02944 4.02944 0 9 0H390C394.971 0 399 4.02944 399 9V129C399 133.971 394.971 138 390 138H8.99999C4.02943 138 0 133.971 0 129V9Z" fill="#091318"/>

            <image xmlns="http://www.w3.org/2000/svg" id="film_cover_small" x="20" y="17" width="70" height="105" xmlns:xlink="http://www.w3.org/1999/xlink" 
            xlink:href="data:image/jpeg;base64"/>
                <text id="stars">
                    <tspan x="104" y="116.636">stars</tspan>
                </text>
            <text id="title">
                <tspan x="106" y="35.8182">title</tspan>
            </text>
            <text id="date" >
                <tspan x="106" y="61.8182">date</tspan>
            </text>
            <text id="ago" >
                <tspan x="360.083" y="116.955">ago</tspan>
            </text>

        </g>
    </a>
</svg>
`;
module.exports = { source };
