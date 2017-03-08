import * as React from "react";
import { Calendar } from "../calendar";
import * as moment from "moment";
type Moment = moment.Moment;

export interface IPickerProps {
	locale: string;
	selected: Moment | [Moment, Moment];
	onSelectDate(date: Moment): void;
	onHoverDate(date: Moment): void;
	onMouseLeaveCalendar(): void;
}

export interface IPickerState {
	year: number;
	month: number;
}

export class Picker extends React.PureComponent<IPickerProps, IPickerState> {
	public constructor(props: IPickerProps) {
		super(props);

		let today = moment();
		this.state = {
			year: today.year(),
			month: today.month()
		};
	}

	public render(): JSX.Element {
		return (
			<div>
				{this.renderCalendar(1, "period-picker-calendar-last")}
				{this.renderCalendar(0, "period-picker-calendar-this")}
			</div>
		);
	}

	private renderCalendar = (offset: number, className: string): JSX.Element => {
		let year = this.state.year;
		let month = this.state.month - offset;

		if(month < 0) {
			month = 11;
			year--;
		}

		return (
			<Calendar
				year={year}
				month={month}
				locale={this.props.locale}
				disableFuture={true}
				highlightToday={false}
				selected={this.props.selected}
				className={"period-picker-calendar " + className}
				onChangeMonth={this.onChangeMonth.bind(this, offset)}
				onSelectDate={this.props.onSelectDate}
				onHoverDate={this.props.onHoverDate}
				onMouseLeaveCalendar={this.props.onMouseLeaveCalendar}
			/>
		);
	}

	private onChangeMonth = (offset: number, year: number, month: number): void => {
		month += offset;

		if(month > 11) {
			month = 0;
			year++;
		}

		this.setState({ year, month });
	}
}