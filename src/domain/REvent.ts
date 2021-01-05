import RRule, { Frequency } from "rrule";
import DateList from "./DateList";

interface Attributes<T> {
  rrule: RRule,
  overrides?: { [targetDate: string]: REvent<T> },
  exclusions?: Date[],
  additions?: Date[],
  payload: T,
}

interface PunctualAttributes<T> {
	date: Date,
	payload: T
}

const frequencies: Record<Frequency, string> = {
  [Frequency.YEARLY]: "Yearly",
  [Frequency.MONTHLY]: "Monthly",
  [Frequency.WEEKLY]: "Weekly",
  [Frequency.DAILY]: "Daily",
  [Frequency.HOURLY]: "Hourly",
  [Frequency.MINUTELY]: "Minutely",
  [Frequency.SECONDLY]: "Secondly",
}

class REvent<T> {
  private rrule: RRule;
  private overrides: { [targetDate: string]: REvent<T> }
  private exclusions: Date[];
  private additions: Date[];

  public payload: T;

  constructor({
    rrule,
    exclusions = [],
    overrides = {},
    additions = [],
    payload
  }: Attributes<T>) {
    this.rrule = rrule;
    this.overrides = overrides;
    this.exclusions = exclusions;
    this.additions = additions;
    this.payload = payload
  }

  public static createPunctual<T>({
      date,
      payload,
    }: PunctualAttributes<T>) {
      const punctual = new RRule({
        dtstart: date,
      });

      return new REvent({rrule:punctual,payload})
  }

  public get frequency() {
    return frequencies[this.rrule.options.freq];
  }

  public get startDate() {
    return this.rrule.options.dtstart.toISOString();
  }

  public get until() {
    return this.rrule.options.until?.toISOString();
  }

  private extraDates(): DateList {
    return new DateList([
      ...Object.values(this.overrides).map((o) => o.all().shift()!),
      ...this.additions
    ])
  }

  private isOverriddenOn(date: Date) {
    return !!this.overrides[date.toISOString()]
  }

  private tooEarly(date: Date, referenceDate: Date): boolean {
    return this.isOverriddenOn(date) || date < referenceDate
  }

  private hasFutureDates(referenceDate: Date): boolean {
    const futureDates = this.extraDates()
      .sortChronologically()
      .after(referenceDate)

    return !futureDates.empty()
  }

  private hasEarlierDates(date: Date, referenceDate: Date): boolean {
    const earlierDates = this.extraDates()
      .between(referenceDate, date)

    return !earlierDates.empty();
  }

  public after(referenceDate: Date): Date | null {
    let found = null;
    this.rrule.all((date) => {
      if (this.tooEarly(date, referenceDate)) {
        return true;
      }

      if (this.hasEarlierDates(date, referenceDate)) {
        found = this.extraDates()
          .afterOrSame(referenceDate)
          .sortChronologically()
          .shift();

        return false;
      }

      if (this.exclusions.includes(date)) {
        return true;
      }

      found = date
      return false
    })

    if (!found && this.hasFutureDates(referenceDate)) {
      return this.extraDates()
        .after(referenceDate)
        .sortChronologically()
        .shift() as Date;
    }

    return found;
  }

  public all(): Date[] {
    let allDates = new DateList(this.additions);
    this.rrule.all((date, len) => {
      if (len === 500) {
        return false;
      }

      if (this.isOverriddenOn(date)) {
        // TODO: Meilleure facon d'aller chercher une date ponctuelle
        const newDate = this.overrides[date.toISOString()]!.all().shift()!
        allDates = allDates.push(newDate as Date);
      }

      if (
        !this.exclusions.find((exclusion) => exclusion.toISOString() === date.toISOString()) &&
        !allDates.contains(date)
      ) {
        allDates = allDates.push(date);
      }

      return true;
    });

    return allDates.sortChronologically().toList();
  }

  public for(date: Date): Date | undefined {
    return this.between(date, date).shift();
  }

  public between(after: Date, before: Date): Date[] {
    let allDates = new DateList(
      this.extraDates().toList().filter((date) => date <= before && date >= after)
    );
    this.rrule.between(after, before, true, (date, len) => {
      if (len === 500) {
        return false;
      }

      if (this.isOverriddenOn(date)) {
        // TODO: Meilleure facon d'aller chercher une date ponctuelle
        const newDate = this.overrides[date.toISOString()]!.all().shift()!
        if (newDate <= before && newDate >= after) {
          allDates = allDates.push(newDate as Date);
        }
      }

      if (
        !this.exclusions.find((exclusion) => exclusion.toISOString() === date.toISOString()) &&
        !allDates.contains(date)
      ) {
        if (date <= before && date >= after) {
          allDates = allDates.push(date);
        }
      }

      return true;
    })

    return allDates.sortChronologically().toList();
  }

  public getPayloadFor(date: Date) {
    if (Object.values(this.overrides).find((o) => o.startDate === date.toISOString())) {
      return Object.values(this.overrides).find((o) => o.startDate === date.toISOString())!.payload
    }

    return this.payload
  }
}

export default REvent;
