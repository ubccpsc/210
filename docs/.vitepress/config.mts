import {
    defineConfig
} from "vitepress";

// import {
//     configureDiagramsPlugin
// } from "vitepress-plugin-diagrams";

import { 
    createBuildTimeDiagramsPlugin 
} from "vitepress-plugin-diagrams";

const { configureMarkdown, vitePlugin } = createBuildTimeDiagramsPlugin({
  diagramsDir: "docs/public/diagrams",
  publicPath: "/210/diagrams",
  // Optional: emit SVGs as build assets at this path
  diagramsDistDir: "diagrams",
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "CPSC 210 Handbook",
    base: "/210/",
    themeConfig: {
        search: {
            provider: 'local'
        },

        // https://vitepress.dev/reference/default-theme-config
        nav: [{
            text: "Home",
            link: "/"
        }, {
            text: "Part 1",
            link: "/part1"
        }, {
            text: "Part 2",
            link: "/part2"
        }, {
            text: "Part 3",
            link: "/part3"
        },],

        sidebar: [{
            text: "Introduction",
            link: "/",
            items: [],
        }, {
            text: "Part 1: Foundations",
            link: "/part1/",
            items: [{
                text: "01: Learning a New Language",
                link: "/part1/01_new-language"
            }, {
                text: "02: Modelling With Types",
                link: "/part1/02_model-types"
            }, {
                text: "03: Checking Invariants",
                link: "/part1/03_checking-invariants"
            }, {
                text: "04: Maintaining Invariants",
                link: "/part1/04_maintaining-invariants"
            }, {
                text: "05: Arrays and Iteration",
                link: "/part1/05_arrays"
            }, {
                text: "06: Mutation and Side Effects",
                link: "/part1/06_state-mutation"
            }, {
                text: "07: Asynchronousity",
                link: "/part1/07_async"
            }, {
                text: "08: Designing for Failure",
                link: "/part1/08_errors"
            }, {
                text: "09: Verifying Behaviour",
                link: "/part1/09_verification"
            }]

        }, // end part 1
        {
            text: "Part 2: Abstraction",
            link: "/part2/",
            items: [{
                text: "10: Building Abstractions",
                link: "/part2/01_abstraction"
            }, {
                text: "11: Decomposing Systems",
                link: "/part2/02_decomposition"
            }, {
                text: "12: Encapsulating What Varies",
                link: "/part2/03_encapsulation"
            }, {
                text: "13: Implementation Freedom",
                link: "/part2/04_flexibility"
            }, {
                text: "14: Defining Boundaries",
                link: "/part2/05_boundaries"
            }, {
                text: "15: Extending Behaviour",
                link: "/part2/06_extension"
            }, {
                text: "16: Growing Systems",
                link: "/part2/07_ocp"
            }],
        }, // end part 2
        {
            text: "Part 3: Evolution",
            link: "/part3/",
            items: [{
                text: "17: Coupling",
                link: "/part3/01_coupling"
            }, 
	    {
                text: "18: Consuming Data",
		link: "/part3/02_consuming_data"
            },
	    {
                text: "19: Designing APIs",
		link: "/part3/03_api_design"
            },
	    {
                text: "20: Code Quality, Refactoring",
		link: "/part3/04_refactoring"
            },
	    {
                text: "21: Debugging",
		link: "/part3/05_debugging"
            },
	    {
                text: "22: Adding New Features",
		link: "/part3/06_new_features"
            }],
        }, // end part 3
        ],

        socialLinks: [{
            icon: "github",
            link: "https://github.com/ubccpsc/210"
        },
        {
            icon: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 1362 1362"><path fill="#010c33" d="M799 1363H1V1h1362v1362zm404.3-600c1.9-15.6 4.4-31 5.5-46.6q5.9-78.9-11.9-155.9a520 520 0 0 0-194.3-302.4C898.1 178 779.2 142.7 647.7 150a529.2 529.2 0 0 0-487.3 627.7 516 516 0 0 0 122.1 249.6c96.8 109 218.4 168.6 363.6 179.5a491 491 0 0 0 178.4-18.9c165.3-49.4 281.1-154.3 348-313.2a479 479 0 0 0 30.8-111.6"/><path fill="#fdfdfd" d="M1203.2 763.4a478 478 0 0 1-30.7 111.2c-66.9 158.9-182.7 263.8-348 313.2a491 491 0 0 1-178.4 18.9c-145.2-10.9-266.8-70.6-363.6-179.5a516 516 0 0 1-122.1-249.6 529.2 529.2 0 0 1 487.3-627.7c131.5-7.2 250.4 28 355 108.2a520 520 0 0 1 194.2 302.4 517 517 0 0 1 11.9 155.9c-1.1 15.5-3.6 31-5.6 47M596.4 182.9l-16.7 3a487 487 0 0 0-217 103.4Q199 425.5 179.7 637.5c-5.2 58.5.4 116.1 15.9 172.7a494 494 0 0 0 164.9 255.4 494 494 0 0 0 286.8 114.2A489 489 0 0 0 779 1171a488 488 0 0 0 228-111q160.7-139.7 175-352.6c4-58.6-2.2-116.3-19.8-172.2-49-156.3-150-265.1-302-326.3-47.3-19-97-29-148-32.2q-57.7-3.7-115.9 6"/><path fill="#010c33" d="M596.8 182.8q57.8-9.7 115.5-6c51 3.1 100.7 13.2 148 32.2 152 61.2 253 170 302 326.3a467 467 0 0 1 19.8 172.2q-14.3 212.8-175 352.7A488 488 0 0 1 779 1171a489 489 0 0 1-131.7 8.7 494 494 0 0 1-286.8-114.2 494 494 0 0 1-165-255.4 484 484 0 0 1-15.8-172.7c12.8-141.3 74-257.5 182.8-348.2A487 487 0 0 1 579.7 186q8.3-1.7 17.1-3.2m-88.5 428.7h6.4v-47H497v-24.1l-1.3-.4c-54.3 0-108.6-.3-163 .1a75 75 0 0 0-51 19.7c-19.3 17.4-26.3 39.5-25 64.7 1.3 27 13 48.1 36 62.6q3.1 2.1 5.5 5c14 15.8 32 24.3 52.7 24.8 35.8.8 71.7.4 107.5.5 1.8 0 3.8-.4 5.5.2 1.5.6 3.5 2 3.7 3.3 2 14.2-4.3 30-23.2 30.3l-7 .2H259v53h23.4v18.3l2.3.3q89.8.1 179.5-.1 28.3-.3 50-18.8c25.3-21.7 32.8-65 14.9-95.1-9-15-20.3-29-32.4-41.5-15.3-15.9-35.6-22-57.6-22h-101q-5.4-.1-10.7-.6c-2-16.2 6.7-33.1 26.4-33.2l6.5-.2zm263.4 144.8c32-9 53.7-28.7 60.5-61.6 3-14 2.3-28.8 2.5-43.3a83 83 0 0 0-14.3-48.6c-8.6-12.6-18.4-24.3-27.8-36.4q-2.7-2.9-5.8-5.5a88 88 0 0 0-60.8-21H626q-7.7.1-15.5 1a65.6 65.6 0 0 0-57.6 65v194.4l.3 4.2h23.5v18.1h46.8v-81.4h18.9v18.2l2.8.2q50.8.2 101.5-.1c8 0 16.2-2 25-3.2m328.7 19.8h-6.3v-24.8H921.7V564.7H904v-24.4h-52.8v236.8a26 26 0 0 0 17.2 25.6q3.5 1 6.9 1.8C879.7 817.8 887 823 901 823h206.4l4.3-.2V776z"/><path fill="#fcfdfd" d="M507.8 611.5H360.4l-6.5.2c-19.7 0-28.4 17-26.4 33.2q5.2.4 10.7.5h101c22 .1 42.3 6.2 57.6 22.1a231 231 0 0 1 32.4 41.5c18 30.1 10.4 73.4-15 95.1a76 76 0 0 1-49.9 18.8q-89.7.2-179.5 0-.8 0-2.3-.2v-18.3H259v-53h178.2l7-.2c19-.3 25.1-16.1 23.2-30.3-.2-1.3-2.2-2.7-3.7-3.3-1.7-.6-3.7-.2-5.5-.2-35.8-.1-71.7.3-107.5-.5q-31.4-1-52.7-24.8a27 27 0 0 0-5.5-5 74 74 0 0 1-36-62.6c-1.3-25.2 5.7-47.3 25-64.7a75 75 0 0 1 51-19.7c54.4-.4 108.7-.1 163-.1l1.3.4v24.1h17.8v47zm-178-42.4c7.2-1.4 14.6-4 22-4 44.4-.5 88.9-.3 133.4-.4h5.6v-18.6c-53.3 0-106.3-1-159.3.3-39.1.8-66.5 28.7-68.9 67.2-1.3 22.2 3.9 42.3 20.4 58.3q1.1 1 3.3 2.6c-18.5-53.1 7.4-93.3 43.4-105.4m109.8 188.3H265v40.4h17.4v-21.7H433q16.5.1 33-.1a25 25 0 0 0 23.6-16.8q4.2-12 0-24a24 24 0 0 0-15.8-15.7v6.2a35 35 0 0 1-5.8 19.8c-6.8 9.6-16.7 12-28.6 11.9m54-85.3a72 72 0 0 0-41.2-19.5c-10.4-1.2-21-1-31.4-1q-45.7-.2-92.4-.1 1 2.9 2.2 5.5c5.4 9.6 14 13.1 24.6 13.1q47.4.1 94.9 0c16.5-.1 32.6 1 47.7 8.8l.7-1z"/><path fill="#fdfdfd" d="M771.4 756.4c-8.4 1.2-16.5 3-24.6 3q-50.7.4-101.5.2-1.1 0-2.8-.2v-18.2h-19v81.4h-46.7v-18.1h-23.5l-.3-4.2q0-97.2 0-194.5c0-33 24.7-60.7 57.6-64.8q7.8-1 15.5-1h100c22.7 0 43.4 5.6 60.8 21q3.1 2.5 5.8 5.4c9.4 12 19.2 23.8 27.8 36.4 10 14.5 14.5 31 14.3 48.6-.2 14.5.4 29.3-2.5 43.3-6.8 33-28.6 52.5-60.9 61.7m17.7-182.7 2.3.4a76.5 76.5 0 0 0-60.5-28c-37-.4-74-.8-111 0-36.6 1-61.5 28-61.1 63.4.6 61 .1 122 .1 183v5.3h17.9V630c-.2-36 26-64 61.8-65 32.3-.7 64.7 0 97-.4 18.3-.2 36.3.6 53.5 9.1m-135.6 37.8q-7.5-.1-15 .4c-8.3.7-13.7 6-14.5 14.4q-.6 8-.4 16v45.1q1 .5 1.3.5c34.2 0 68.3.4 102.5 0 19.4-.3 33.5-11.6 36-29 1.5-11 1.7-22.5 0-33.4-2.6-16.3-2-12.6-15.9-14q-2-.1-4 0zm49 101.3c17-.2 34 .4 51-1 18.9-1.5 32.3-14.9 34.1-33.3 1-9.7 1.3-19.8 0-29.4-1.2-7.7-4.5-15.2-8.1-22.2-2.2-4.3-6.8-7.3-10-10.6.1 13.2.7 25.8.5 38.4a37 37 0 0 1-10.3 25.3 46 46 0 0 1-34.7 14H625v40.7h17.3v-21.9zM1101 776h10.8v46.8l-4.3.2H901.1c-14.1 0-21.4-5.2-26-18.5q-3.2-.7-6.8-1.8A26 26 0 0 1 851 777V540.3h52.8v24.4h17.8v186.6h172.5V776zM875 629.5v-65h22.6v-18.1h-40.5v233.2c1 9.8 7.7 16.9 17.8 18.2zm122.6 127.9H922v18.5h166v-18.5z"/><path fill="#051036" d="M329.3 569.2c-35.6 12-61.5 52.2-43 105.3-1.5-1.2-2.5-1.8-3.3-2.6-16.5-16-21.7-36.1-20.4-58.3 2.4-38.5 29.8-66.4 69-67.2 52.9-1.2 105.9-.3 159.2-.3v18.6h-5.6q-66.8-.1-133.5.4c-7.3 0-14.7 2.6-22.4 4"/><path fill="#061037" d="M440 757.4c11.4.1 21.3-2.3 28-12 4.3-5.9 5.7-12.6 6-19.7v-6.2c8.2 2.5 13 8.2 15.7 15.7q4.2 12 0 24A25 25 0 0 1 466 776q-16.5.2-33 0l-144.8.1h-5.7v21.7H265v-40.4z"/><path fill="#071238" d="m493.7 672.3 5 5.5-.8 1c-15-7.8-31.2-8.8-47.7-8.7q-47.5.2-95 0c-10.5 0-19.1-3.5-24.5-13.1q-1.2-2.6-2.2-5.5H421c10.4 0 21-.1 31.4 1a73 73 0 0 1 41.4 19.8"/><path fill="#030d34" d="M654 611.5h89.5q2-.1 4 0c13.9 1.4 13.3-2.3 15.9 14 1.7 10.9 1.5 22.4 0 33.3-2.5 17.5-16.6 28.8-36 29-34.2.5-68.3.2-102.5.1q-.4 0-1.3-.5v-45.1q-.2-8 .4-16c.8-8.4 6.2-13.7 14.6-14.4q7.4-.4 15.4-.4"/><path fill="#051036" d="M788.8 573.2c-17-8-35-8.8-53.2-8.6-32.3.4-64.7-.3-97 .5-35.9.8-62 29-61.9 65q.2 82.2 0 164.4v3.3H559v-5.3c0-61 .5-122-.1-183a60.5 60.5 0 0 1 61-63.3c37-.9 74-.5 111 0 23 .2 43 8.2 58.5 26.1z"/><path fill="#051036" d="M702 712.8h-59.8v22h-17.3V694h100.2a46 46 0 0 0 34.6-14q10.1-10.8 10.3-25.3c.2-12.6-.4-25.2-.6-38.4 3.3 3.3 7.9 6.3 10.1 10.6 3.6 7 7 14.5 8 22.2 1.4 9.6 1.1 19.7.1 29.4a36 36 0 0 1-34.2 33.3c-16.9 1.4-34 .8-51.4 1M789.5 572.6q.7.2 1.9 1.5a8 8 0 0 1-2.5-.6q0-.5.6-.9"/><path fill="#040f36" d="M875 630v167.8a19.6 19.6 0 0 1-18-20.2V546.4h40.6v18.1H875z"/><path fill="#071238" d="M998 757.4h90v18.5H922v-18.5z"/></svg>'
            },
            link: "https://spl.cs.ubc.ca",
            ariaLabel: "UBC SPL"
        },
        ],
    },
    markdown: {
        // config: (md) => {
        //     configureDiagramsPlugin(md, {
        //         diagramsDir: "docs/public/diagrams",
        //         publicPath: "/210/diagrams", // works on GitHub
        //         krokiServerUrl: "https://kroki.io", // diagram generation service
        //         excludedDiagramTypes: [],
        //     });
        // },
        config: (md) => configureMarkdown(md),
    },
    vite: {
        plugins: [vitePlugin()],
  },
});
