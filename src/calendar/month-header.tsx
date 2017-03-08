import * as React from "react";
import * as moment from "moment";

export interface ICalendarMonthHeaderProps {
	locale: string;
}

export class CalendarMonthHeader extends React.PureComponent<ICalendarMonthHeaderProps, {}> {
	public render(): JSX.Element {
		let iterator = moment().locale(this.props.locale).startOf("week");
		let cells: JSX.Element[] = [];

		/* always seven days in a week */
		for(let i = 0; i < 7; i++) {
			let key = iterator.weekday();
			let name = iterator.format("ddd");

			cells.push(<th key={key}>{name}</th>);
			iterator.add(1, "day");
		}

		return (<tr>{cells}</tr>);
	}
}