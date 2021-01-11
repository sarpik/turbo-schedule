import { Dictionary } from "./Dictionary";

const weekdays: Array<string> = [
	"Pirmadienis", //
	"Antradienis",
	"Trečiadienis",
	"Ketvirtadienis",
	"Penktadienis",
	"Šeštadienis",
	"Sekmadienis",
];

export const lt: Dictionary = {
	"Turbo Schedule": "Turbo Tvarkaraštis",
	Schedule: "Tvarkaraštis",
	Statistics: "Statistika",
	About: "Apie mus",
	Language: "Kalba",
	en: "Anglų (English)",
	lt: "Lietuvių (Lithuanian)",
	weekday: (index: number) => weekdays[index],
	"I am": "Aš esu",
	"Student not found": (name: string) => `Moksleivis "${name}" nerastas...`,
	"Go back and search for a different one": "Grįžk ir ieškok kito!",
	"Loading data": "Siurbiame duomenis...",
	"Interested in what's coming next?": "Įdomu, kas bus toliau?",
	"Enter email get notified": "Įvesk savo paštą ir gauk pranešimą, kai mes (aš, Kipras :D) padarom ką nors awesome!",
	"we promise to not spam!": "prižadame ne'spam'inti!",
	"you can cancel anytime": "galite bet kada atšaukti",
	"eg.": "pvz.",
	"Notify me about the updates!": "Pranešti man apie atnaujinimus!",
	"Email received successfully - thank You for trusting us:)":
		"El. paštas gautas sėkmingai - dėkojame už pasitikėjimą:)",
	Enter: "Enter",
	Week: "Savaitė",
	"Go back": "Grįžti",
	Lesson: "Pamoka",
	custom: (count) => `county count ${count}`,
	Close: "Uždaryti",
	Empty__lesson: "Laisva",
	Students: "Mokiniai",
	Teachers: "Mokytojai",
	Classes: "Klasės",
	Rooms: "Kabinetai",
	toCompactString: (items: string[]): string =>
		items.length > 1 ? `${items[0]} ir dar ${items.length - 1}` : items[0],

	"Made with love by (__html)": `Su <span aria-label="love">❤</span> sukūrė`,
	Availability: "Prieinamumas" /** TODO IMPROVE lol */,
	Common: "Bendras",
	"Common Availability": "Bendras prieinamumas" /** TODO IMPROVE lol */,
};
