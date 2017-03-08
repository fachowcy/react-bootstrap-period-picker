import * as React from "react";
import * as moment from "moment";
import * as classnames from "classnames";
type Moment = moment.Moment;

export interface ICalendarWeekProps {
	date: Moment;

	highlightRange?: [Moment, Moment];
	today: any; // not boolean due to PhpStorm bug
	disabled: any; // not boolean due to PhpStorm bug

	onSelectDate(date: Moment): void;
	onHoverDate(date: Moment): void;
}

export class CalendarDay extends React.PureComponent<ICalendarWeekProps, {}> {
	public render(): JSX.Element {
		let date = this.props.date;
		let classes = {"ts-calendar-day": true};

		if(this.props.highlightRange) {
			if(date.isSame(this.props.highlightRange[0], "day")) {
				classes["ts-calendar-day-selected"] = true;
				classes["ts-calendar-day-selected-first"] = true;
			}

			if(date.isSame(this.props.highlightRange[1], "day")) {
				classes["ts-calendar-day-selected"] = true;
				classes["ts-calendar-day-selected-last"] = true;
			}

			if(date.isBetween(this.props.highlightRange[0], this.props.highlightRange[1], "day", "()")) {
				classes["ts-calendar-day-in-range"] = true;
			}
		}

		if(this.props.today) {
			classes["ts-calendar-day-today"] = true;
		}

		if(this.props.disabled) {
			classes["ts-calendar-day-disabled"] = true;
		}

		return (
			<td>
				<div className={classnames(classes)} onClick={!this.props.disabled ? this.onSelectDate : null} onMouseEnter={this.onHoverDate}>
					{date.date()}
				</div>
			</td>
		);
	}

	private onSelectDate = (e: React.MouseEvent<HTMLDivElement>): void => {
		e.stopPropagation();
		this.props.onSelectDate(this.props.date);
	}

	private onHoverDate = (): void => this.props.onHoverDate(this.props.date);
}