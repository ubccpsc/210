import {
	defineConfig
} from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "CPSC 210 Course Reader",
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
		}, ],

		sidebar: [{
				text: "Introduction",
				link: "/",
				items: [],
			}, {
				text: "Part 1: Basics",
				link: "/part1/",
				items: [{
					text: "Designing with Data",
					collapsed: true,
					items: [{
						text: "Overview",
						link: "/part1/01-data/00-overview"
					}, {
						text: "Modelling Information as Data",
						link: "/part1/01-data/01-modelling_data",
					}, {
						text: "Designing Functions that Operate on Data",
						link: "/part1/01-data/02-working_with_data",
					}, {
						text: "Designing Tests from Data and Functions",
						link: "/part1/01-data/03-testing_over_data",
					}, {
						text: "Abstract Patterns over Data (Arrays)",
						link: "/part1/01-data/04-abstract_data_patterns",
					}, {
						text: "TypeScript's Type Checker",
						link: "/part1/01-data/05-language_mechanics",
					}, {
						text: "Synthesis: Information as Data",
						link: "/part1/01-data/06-synthesis",
					}, ],
				}, {
					text: "Contracts and Invariants",
					collapsed: true,
					items: [{
						text: "Overview",
						link: "/part1/02-contracts/00-overview",
					}, {
						text: "Limits of Types and the Need for Contracts",
						link: "/part1/02-contracts/01-type_limitations",
					}, {
						text: "Invariants",
						link: "/part1/02-contracts/02-invariants",
					}, {
						text: "Owning Invariants with Modules",
						link: "/part1/02-contracts/03-modules",
					}, {
						text: "Synthesis: Contracts and Invariant Ownership",
						link: "/part1/02-contracts/04-synthesis",
					}, ],
				}, ]
			}, // end part 1
			{
				text: "Part 2: Designing Abstractions",
				link: "/part2/",				
				items: [
					{
						text: "Abstraction",
						link: "/part2/01-abstraction/"
					},
					{
						text: "Decomposition",
						link: "/part2/02-decomposition/"
					},
					{
						text: "Verification",
						link: "/part2/03-verification/"
					},
					{
						text: "Error Handling",
						link: "/part2/04-errors/"
					},
					{
						text: "Encapsulation",
						link: "/part2/05-encapsulation/"
					},
					{
						text: "Boundaries",
						link: "/part2/06-boundaries/"
					},
					{
						text: "Extension",
						link: "/part2/07-extension/"
					},
					{
						text: "Open/Closed",
						link: "/part2/08-ocp/"
					}
					],
			}, // end part 2
			{
				text: "Part 3: Enabling Evolution",
				link: "/part3/",				
				items: [],
			}, // end part 3
		],

		socialLinks: [{
			icon: "github",
			link: "https://github.com/ubccpsc/210"
		}, ],
	},
});
