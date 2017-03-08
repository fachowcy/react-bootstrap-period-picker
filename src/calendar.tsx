import * as React from "react";
import * as moment from "moment";
import * as classnames from "classnames";
import { Button } from "react-bootstrap";
import { CalendarMonth } from "./calendar/month";

type Moment = moment.Moment;
type MomentTuple = [string | Moment, string | Moment];

export interface ICalendarProps {
	/**
	 * Date or range of dates selected
	 */
	selected?: string | Moment | MomentTuple;

	/**
	 * Locale to use. This will affect language,
	 * default date format, first day of the week
	 * setting, etc.
	 */
	locale?: string;

	/**
	 * Default month & year to display in
	 * calendar card
	 */
	month?: number | undefined;
	year?: number | undefined;

	/**
	 * Shall we render next / prev month
	 * buttons in calendar header?
	 */
	renderNextMonthButton?: any; // not boolean due to PhpStorm bug
	renderPrevMonthButton?: any; // not boolean due to PhpStorm bug

	/**
	 * Shall we highlight today's date?
	 */
	highlightToday?: any; // not boolean due to PhpStorm bug

	/**
	 * Predefined disable filters for common situations:
	 * future dates and past dates.
	 */
	disableFuture?: any; // not boolean due to PhpStorm bug
	disablePast?: any; // not boolean due to PhpStorm bug

	/**
	 * Additional class names fro calendar class
	 */
	className?: string;

	/**
	 * Month has been switched
	 *
	 * @param year
	 * @param month
	 */
	onChangeMonth?(year: number, month: number);

	/**
	 * Date has been picked.
	 * @param date
	 */
	onSelectDate?(date: Moment);

	/**
	 * Mouse pointer is over date
	 * @param date
	 */
	onHoverDate?(date: Moment);

	/**
	 * Mouse pointer is outside of calendar
	 * available dated.
	 */
	onMouseLeaveCalendar?(): void;

	/**
	 * Custom date filter for enabling & disabling
	 * dates in calendar.
	 * @param date
	 */
	isDateDisabled?(date: Moment): boolean;
}

export interface ICalendarState {
	startOfMonth: Moment;
	endOfMonth: Moment;
}

export class Calendar extends React.PureComponent<ICalendarProps, ICalendarState> {
	public static defaultProps: ICalendarProps = {
		locale: "en",
		renderPrevMonthButton: true,
		renderNextMonthButton: true,
		highlightToday: true
	};

	private today: Moment;

	public constructor(props: ICalendarProps) {
		super(props);
		this.state = this.getStateFromYearMonth(props.year, props.month, props.locale);
	}

	public componentWillReceiveProps(newProps: ICalendarProps) {
		if(newProps.year != this.props.year || newProps.month != this.props.month || newProps.locale != this.props.locale) {
			let newState = this.getStateFromYearMonth(newProps.year, newProps.month, newProps.locale);
			this.setState(newState);
		}
	}

	public getStateFromYearMonth(year: number, month: number, locale: string): ICalendarState {
		let today = moment();

		if(typeof year === "undefined" || null === year) {
			year = today.year();
		}

		if(typeof month === "undefined" || null === month) {
			month = today.month();
		}

		return {
			startOfMonth: moment({ year, month }).locale(locale).startOf("month"),
			endOfMonth: moment({ year, month }).locale(locale).endOf("month")
		};
	}

	public render(): JSX.Element {
		return (
			<div className={classnames("ts-calendar", this.props.className)}>
				<div className="ts-calendar-header">
					{this.renderPrevMonthButton()}
					<span>{this.state.startOfMonth.format("MMMM YYYY")}</span>
					{this.renderNextMonthButton()}
				</div>
				<CalendarMonth
					locale={this.props.locale}
					startOfMonth={this.state.startOfMonth}
					endOfMonth={this.state.endOfMonth}
					highlightToday={this.props.highlightToday}
					selected={this.getSelectedRange(this.props.selected)}
					isDateDisabled={this.isDateDisabled}
					onSelectDate={this.onSelectDate}
					onHoverDate={this.onHoverDate}
					onMouseLeaveCalendar={this.onMouseLeaveCalendar}
				/>
			</div>
		);
	}

	private renderPrevMonthButton(): JSX.Element {
		if(!this.props.renderPrevMonthButton) {
			return null;
		}

		return <Button onClick={this.onChangeMonth.bind(this, -1)} className="ts-calendar-prev-month-btn">&laquo;</Button>;
	}

	private renderNextMonthButton(): JSX.Element {
		if(!this.props.renderNextMonthButton) {
			return null;
		}

		return <Button onClick={this.onChangeMonth.bind(this, 1)} className="ts-calendar-next-month-btn">&raquo;</Button>;
	}

	private onSelectDate = (date: Moment): void => {
		if(this.props.onSelectDate) {
			this.props.onSelectDate(date);
		}
	}

	private onHoverDate = (date: Moment): void => {
		if(this.props.onHoverDate) {
			this.props.onHoverDate(date);
		}
	}

	private onMouseLeaveCalendar = (): void => {
		if(this.props.onMouseLeaveCalendar) {
			this.props.onMouseLeaveCalendar();
		}
	}

	private onChangeMonth = (direction: number, e: Event): void => {
		e.stopPropagation();

		let target = this.state.startOfMonth.clone().add(direction, "month");
		let year = target.year();
		let month = target.month();

		if(this.props.onChangeMonth) {
			this.props.onChangeMonth(year, month);
		} else if(!this.props.onChangeMonth && !this.props.year && !this.props.month) {
			this.setState({
				startOfMonth: moment({ year: year, month: month }).locale(this.props.locale).startOf("month"),
				endOfMonth: moment({ year: year, month: month }).locale(this.props.locale).endOf("month")
			});
		}
	}

	private isDateDisabled = (date: Moment): boolean => {
		if(this.props.disableFuture && date.isAfter(this.today, "day"))
			return true;

		if(this.props.disablePast && date.isBefore(this.today, "day"))
			return true;

		if(this.props.isDateDisabled) {
			return this.props.isDateDisabled(date);
		} else {
			return false;
		}
	}

	private getSelectedRange = (range: string | Moment | MomentTuple): [Moment, Moment] => {
		if(!range) {
			return null;
		}

		if(this.isTuple(range)) {
			return [moment(range[0]), moment(range[1])];
		} else {
			return [moment(range), moment(range)];
		}
	}

	private isTuple = (range: string | Moment | [string | Moment, string | Moment]): range is MomentTuple  => {
		return Array.isArray(range);
	}
}