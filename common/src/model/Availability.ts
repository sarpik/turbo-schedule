import { Lesson } from "./Lesson";

export interface Availability {
	dayIndex: Lesson["dayIndex"];
	timeIndex: Lesson["timeIndex"];
	/** TODO FIXME (needs populating) */
	// availableParticipants: Participant["text"][];
	// bussyParticipants: Participant["text"][];
	availableParticipants: number;
	bussyParticipants: number;
}
