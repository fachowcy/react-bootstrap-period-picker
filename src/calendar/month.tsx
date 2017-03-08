import * as React from "react";
import { Moment } from "moment";
import { CalendarMonthHeader } from "./month-header";
import { CalendarDay } from "./day";

export interface ICalendarMonthProps {
	locale: string;
	selected: [Moment, Moment];

	startOfMonth: Moment;
	endOfMonth: Moment;

	highlightToday: any; // not boolean due to PhpStorm bug

	onSelectDate(date: Moment): void;
	onHoverDate(date: Moment): void;
	onMouseLeaveCalendar(): void;
	isDateDisabled?(date: Moment): boolean;
}

export class CalendarMonth extends React.PureComponent<ICalendarMonthProps, {}> {
	private days: Moment[][];

	public constructor(props: ICalendarMonthProps) {
		super(props);
		this.days = this.createDays(props.startOfMonth, props.endOfMonth);
	}

	public componentWillReceiveProps(newProps: ICalendarMonthProps): void {
		if(newProps.startOfMonth != this.props.startOfMonth || newProps.endOfMonth != this.props.endOfMonth) {
			this.days = this.createDays(newProps.startOfMonth, newProps.endOfMonth);
		}
	}

	public render(): JSX.Element {
		let rows: JSX.Element[] = new Array(this.days.length);
		for(let i = 0; i < this.days.length; i++) {
			let cols: JSX.Element[] = new Array(7);

			for(let j = 0; j < this.days[i].length; j++) {
				if(this.days[i][j]) {
					let disabled: boolean = this.props.isDateDisabled && this.props.isDateDisabled(this.days[i][j]);
					let today: boolean = this.props.highlightToday && true;

					cols[j] = <CalendarDay
									key={j}
									date={this.days[i][j]}
									disabled={disabled}
									today={today}
									highlightRange={this.props.selected}
									onSelectDate={this.props.onSelectDate}
									onHoverDate={!disabled ? this.props.onHoverDate : this.props.onMouseLeaveCalendar}
					/>;
				} else {
					cols[j] = <td key={j} onMouseEnter={this.props.onMouseLeaveCalendar} />;
				}
			}

			rows[i] = <tr key={i}>{cols}</tr>;
		}

		return (
			<table>
				<thead>
					<CalendarMonthHeader locale={this.props.locale} />
				</thead>
				<tbody onMouseLeave={this.props.onMouseLeaveCalendar}>
					<tr className="break"><td /></tr>
					{rows}
				</tbody>
			</table>
		);
	}

	private createDays(startOfMonth: Moment, endOfMonth: Moment): Moment[][] {
		let iterator = startOfMonth.clone();
		let noDaysInMonth = endOfMonth.date();

		let weekNumberOfLastIteration = iterator.week();
		let thisWeekOfMonth = 0;

		/* create array of weeks in month */
		let days: Moment[][] = new Array(Math.ceil(noDaysInMonth / 7));
		/* create array for the first week */
		days[0] = new Array(7);

		for(let i = 0; i < noDaysInMonth; i++) {
			let weekNumberOfThisIteration = iterator.week();
			if(weekNumberOfThisIteration != weekNumberOfLastIteration) {
				days[++thisWeekOfMonth] = new Array(7);
				weekNumberOfLastIteration = weekNumberOfThisIteration;
			}

			let thisDayOfWeek = iterator.weekday();
			days[thisWeekOfMonth][thisDayOfWeek] = iterator.clone();
			iterator.add(1, "day");
		}

		return days;
	}
}