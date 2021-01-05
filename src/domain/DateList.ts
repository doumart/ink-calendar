class DateList {
	private list: Date[];
	constructor(dates: Date[] = []) {
		this.list = dates;
	}

  public toList() {
    return this.list;
  }

	public sortChronologically(): DateList {
		return new DateList(this.list.sort((date1, date2) =>
			date1.toISOString().localeCompare(date2.toISOString())
		))
	}

	public filter(cb: (date: Date) => boolean): DateList {
		return new DateList(this.list.filter(cb))
	}

	public shift(): Date | undefined {
		return this.list.shift();
	}

	public after(date: Date): DateList {
		return new DateList(this.list.filter((d) => d > date))
	}

	public afterOrSame(date: Date): DateList {
		return new DateList(this.list.filter((d) => d >= date))
	}

	public contains(date: Date): boolean {
		return this.list.some((d) => d.toISOString() === date.toISOString())
	}

	public between(start: Date, end: Date): DateList {
		return new DateList(this.list.filter((d) => d > start && d < end))
	}

	public empty(): boolean {
		return this.list.length === 0;
	}

	public push(date: Date): DateList {
		return new DateList([...this.list, date])
	}
}

export default DateList;
