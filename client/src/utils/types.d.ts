export type SetStateArgs<T> = (newValue: T | ((previousValue: T) => T)) => void;
