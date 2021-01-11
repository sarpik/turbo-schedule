import { Dictionary } from "./Dictionary";

const weekdays: Array<string> = [
	"Monday", //
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const en: Dictionary = {
	"Turbo Schedule": "Turbo Schedule",
	Schedule: "Schedule",
	Statistics: "Statistics",
	About: "About",
	Language: "Language",
	en: "English (Anglų)",
	lt: "Lithuanian (Lietuvių)",
	weekday: (index: number) => weekdays[index],
	"I am": "I am",
	"Student not found": (name: string) => `Student "${name}" not found...`,
	"Go back and search for a different one": "Go back search for a different one",
	"Loading data": "Loading data",
	"Interested in what's coming next?": "Interested in what's coming next?",
	"Enter email get notified": "Enter your email and get a notification once we (I, Kipras :D) do something awesome!",
	"we promise to not spam!": "we promise to not spam!",
	"you can cancel anytime": "you can cancel anytime",
	"eg.": "eg.",
	"Notify me about the updates!": "Notify me about the updates!",
	"Email received successfully - thank You for trusting us:)":
		"Email received successfully - thank You for trusting us:)",
	Enter: "Enter",
	Week: "Week",
	"Go back": "Go back",
	Lesson: "Lesson",
	custom: (count: number, count2: number | undefined) => `Sup nerd ${count}, how're you doing, ${count2}`,
	Close: "Close",
	Empty__lesson: "Empty",
	Students: "Students",
	Teachers: "Teachers",
	Classes: "Classes",
	Rooms: "Rooms",
	toCompactString: (items: string[]): string =>
		items.length > 1 ? `${items[0]} and ${items.length - 1} more` : items[0],
	"Made with love by (__html)": `Made with <span aria-label="love">❤</span> by`,
	Availability: "Availability",
	Common: "Common",
	"Common Availability": "Common availability",
};
