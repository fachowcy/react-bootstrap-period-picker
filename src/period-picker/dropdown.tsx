import * as React from "react";
import * as moment from "moment";
import { DropdownMenuProps, Button } from "react-bootstrap";
import { Picker } from "./picker";
import { DropdownLink } from "./dropdown-link";
import { findDOMNode } from "react-dom";
type Moment = moment.Moment;

export interface IDropdownProps extends DropdownMenuProps {
	initialValue: Moment | [Moment, Moment];
	overallFromDate: string;
	overallToDate: string;
	locale: string;
	bsRole?: string;
	translator(msg: string): string;
	onChoose(range: Moment | [Moment, Moment]): void;
	onCancel(): void;
}

export interface IDropdownState {
	/**
	 * Currently chosen value or part of value
	 */
	value?: Moment | [Moment, Moment];

	/**
	 * Currently highlighted value
	 */
	highlight?: Moment | [Moment, Moment];
}

export class PeriodPickerDropdown extends React.PureComponent<IDropdownProps, IDropdownState> {
	/**
	 * Predefined period options.
	 */
	private options: { [key: string]: Moment | [Moment, Moment] };

	public constructor(props: IDropdownProps) {
		super(props);
		this.state = { value: props.initialValue, highlight: null };

		let today = moment().locale(this.props.locale);
		this.options = {
			today: today,
			yesterday: today.clone().add(-1, "day"),
			last7days: [today.clone().add(-6, "day"), today],
			last30days: [today.clone().add(-29, "day"), today],
			thisMonth: [today.clone().startOf("month"), today],
			lastMonth: [today.clone().add(-1, "month").startOf("month"), today.clone().add(-1, "month").endOf("month")],
			overall: null
		};

		if(this.props.overallFromDate) {
			this.options["overall"] = [
				moment(props.overallFromDate).locale(this.props.locale),
				props.overallToDate ? moment.min(moment(props.overallToDate).locale(this.props.locale), today) : today
			];
		}
	}

	/**
	 * If initial value has changed or dropdown has been closed.
	 * @param newProps
	 */
	public componentWillReceiveProps(newProps: IDropdownProps) {
		if(newProps.initialValue != this.props.initialValue || (this.props.open && !newProps.open)) {
			this.setState({ value: newProps.initialValue, highlight: null });
		}

		if(newProps.open && !this.props.open) {
			let node = findDOMNode(this) as HTMLDivElement;
			let nodeLeft = node.offsetLeft;
			let nodeRight = Math.floor(node.getBoundingClientRect().right);
			let bodyRight = Math.floor(document.body.getBoundingClientRect().right - 30);

			/**
			 * If right corner is outside body, adjust position.
			 * Also if left was previously set, and right corner is not
			 * near body (10px boundary, readjust position.
			 */
			if(nodeRight > bodyRight || (nodeLeft < 0 && nodeRight + 10 < bodyRight)) {
				node.style.left =  Math.min(nodeLeft + bodyRight - nodeRight, 0) + "px";
			}
		}
	}

	public render(): JSX.Element {
		let className = "dropdown-menu dropdown-menu-period-picker";
		if(this.props.pullRight) className += " dropdown-menu-right";

		return (
			<div className={className} onClick={this.onClickAnywhere}>
				<div className="dropdown-menu-period-picker-sidebar">
					<nav className="nav sidebar-nav" onMouseLeave={this.onMouseLeavePickingSpace}>
						{this.renderPredefinedElement("today", "Today")}
						{this.renderPredefinedElement("yesterday", "Yesterday")}
						{this.renderPredefinedElement("last7days", "Last 7 days")}
						{this.renderPredefinedElement("last30days", "Last 30 days")}
						{this.renderPredefinedElement("thisMonth", "This month")}
						{this.renderPredefinedElement("lastMonth", "Last month")}
						{this.renderPredefinedElement("overall", "Overall")}
					</nav>
				</div>
				<div className="hidden-xs dropdown-menu-period-picker-content">
					<Picker
						locale={this.props.locale}
						selected={this.state.highlight || this.state.value}
						onSelectDate={this.onClickCalendarDate}
						onHoverDate={this.onHoverCalendarDate}
						onMouseLeaveCalendar={this.onMouseLeavePickingSpace}
					/>
					{this.renderDate()}
					{this.renderControlButtons()}
				</div>
			</div>
		);
	}

	public renderPredefinedElement(name: string, desc: string) {
		if(!this.options[name]) return null;
		return <DropdownLink option={name} onClick={this.onClickPredefinedOption} onMouseEnter={this.onHoverPredefinedOption}>{this.props.translator(desc)}</DropdownLink>;
	}

	/**
	 * Handler called when date in calendar gets
	 * clicked. Value should be updated.
	 * @param date
	 */
	private onClickCalendarDate = (date: Moment): void => {
		if(!this.state.value) {
			/**
			 * If we have no value, let's start new value picking session.
			 */
			this.setState({ value: date, highlight: null });

		} else if(this.isMoment(this.state.value)) {
			/**
			 * Currently we have only single value, let's
			 * compose it with newly selected date.
			 */
			let value: [Moment, Moment];
			if(date.isSame(this.state.value, "days")) {
				/**
				 * If the same date was clicked for the second
				 * time, toggle it off.
				 */
				value = null;
			} else if(date.isBefore(this.state.value, "days")) {
				/**
				 * New date is younger that old date
				 */
				value = [date, this.state.value];
			} else {
				/**
				 * New date is older than old date
				 */
				value = [this.state.value, date];
			}

			this.setState({ value, highlight: null });
		} else {
			/**
			 * We already have two dates chosen. Most likely
			 * user wan't to set a new, different period. Check
			 * what exactly was clicked.
			 */
			if(date.isSame(this.state.value[0], "days")) {
				/**
				 * If user has clicked first date, toggle it off.
				 */
				this.setState({ value: this.state.value[1], highlight: null });

			} else if(date.isSame(this.state.value[1], "days")) {
				/**
				 * If user has clicked second date, toggle it off.
				 */
				this.setState({ value: this.state.value[0], highlight: null });

			} else {
				/**
				 * User has clicked something completely different. Erase
				 * previous selection.
				 */
				this.setState({ value: date, highlight: null });
			}
		}
	}

	/**
	 * Handler called when date in calendar gets
	 * hover. Result depends on current value state.
	 *
	 * @param date
	 */
	private onHoverCalendarDate = (date: Moment): void => {
		if(!this.state.value) {
			/**
			 * If currently there's no value, highlight hover
			 * as first selected item.
			 */
			this.setState({ highlight: date });

		} else if(this.isMoment(this.state.value)) {
			/**
			 * If value currently has only one date, highlight
			 * a range composed from value and hovered date.
			 */
			if(date.isBefore(this.state.value)) {
				this.setState({ highlight: [date, this.state.value] });
			} else {
				this.setState({ highlight: [this.state.value, date] });
			}

		}
		/* Otherwise do not highlight anything, as value selecting is completed */
	}

	/**
	 * Handler called when one of predefined options gets
	 * clicked. Value gets automatically chosen and
	 * we can inform parent, that the whole process is
	 * completed.
	 *
	 * @param option
	 */
	private onClickPredefinedOption = (option: string): void => {
		this.setState({ value: this.options[option], highlight: null }, () => this.props.onChoose(this.state.value));
	}

	/**
	 * Accept button has been clicked.
	 */
	private onAcceptSelectedDate = (e: React.MouseEvent<Button>): void => {
		e.stopPropagation();
		if(this.state.value) {
			this.setState({ highlight: null }, () => this.props.onChoose(this.state.value));
		}
	}

	private onCancel = (e: React.MouseEvent<Button>): void => {
		e.stopPropagation();
		this.setState({ value: this.props.initialValue, highlight: null }, () => this.props.onCancel());
		this.props.onCancel();
	}

	/**
	 * Handler called when predefined one of options gets
	 * hover. We shall highlight option in
	 * calendar.
	 *
	 * @param option
	 */
	private onHoverPredefinedOption = (option: string): void => {
		this.setState({ highlight: this.options[option] });
	}

	/**
	 * Any click in the non-clickable space should reset
	 * value back to nothing.
	 */
	private onClickAnywhere = (): void => {
		this.setState({ value: null, highlight: null });
	}

	/**
	 * When mouse leaves space where user can pick something,
	 * highlight should be removed to avoid confusion. Only
	 * selected value is persistent.
	 */
	private onMouseLeavePickingSpace = (): void => {
		this.setState({ highlight: null });
	}

	/**
	 * Display selected / highlighted date summary in
	 * picker's footer.
	 */
	private renderDate(): JSX.Element {
		let value = this.state.highlight || this.state.value;
		if(!value) return null;

		let formatString = "ddd, ll";

		if(this.isMoment(value)) {
			// noinspection TypeScriptUnresolvedFunction
			return <p className="period-picker-summary"><span>{value.format(formatString)}</span></p>;
		} else {
			return <p className="period-picker-summary"><span>{value[0].format(formatString)}</span> - <span>{value[1].format(formatString)}</span></p>;
		}
	}

	/**
	 * Render date confirm button if required
	 */
	private renderControlButtons(): JSX.Element {
		return (
			<div className="period-picker-control-buttons">
				<Button bsSize="small" className="period-picker-confirm-btn" onClick={this.onCancel}>{this.props.translator("Close")}</Button>
				<Button bsStyle="primary" bsSize="small" className="period-picker-confirm-btn" disabled={!this.state.value} onClick={this.onAcceptSelectedDate}>{this.props.translator("Apply")}</Button>
			</div>
		);
	}

	/**
	 * Single value or range?
	 *
	 * @param value
	 */
	private isMoment(value: Moment | [Moment, Moment]): value is Moment {
		return !Array.isArray(value);
	}
}