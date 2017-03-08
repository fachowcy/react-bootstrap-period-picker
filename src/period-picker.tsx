import * as React from "react";
import * as moment from "moment";
import { Dropdown, DropdownBaseProps } from "react-bootstrap";

import { buildFrom } from "./object-builder";
import { PeriodPickerDropdown } from "./period-picker/dropdown";

type Moment = moment.Moment;
const ToggleButton = Dropdown.Toggle;

/**
 * Props available on this component.
 */
export interface IPeriodPickerProps extends DropdownBaseProps {
	// Default text shown when no period is selected
	placeholder: string;
	// Locale - moment.js locales are available
	locale?: string;
	// Don't allow to select starting date lesser than:
	minFrom?: string;
	// Don't allow to select ending date greater than:
	maxTo?: string;
	// Current starting date value
	from?: string;
	// Current ending date value
	to?: string;
	// Pull bootstrap's dropdown menu to right instead of left
	pullRight?: boolean;
	// Additional translating method for string not translated natively by moment.js
	translator?(msg: string): string;
	// Callback fired once user selects period or selects no period
	onChange?(from: string, to: string): void;
}

/**
 * Internal component state
 */
interface IPeriodPickerState {
	// is currently open
	open?: boolean;
	// caching value in state speeds things up a lot
	value?: Moment | [Moment, Moment];
}

/**
 * The component class
 */
export default class PeriodPicker extends React.PureComponent<IPeriodPickerProps, IPeriodPickerState> {
	public static defaultProps = {
		// identity fn by default
		translator: (msg: string): string => msg,
		onChange: () => undefined
	};

	public constructor(props: IPeriodPickerProps) {
		super(props);

		this.state = {
			open: false,
			value: this.composeValue(props.from, props.to, props.locale)
		};
	}

	/**
	 * Check whether any important rendering prop is changed and update state
	 * if required.
	 */
	public componentWillReceiveProps(newProps: IPeriodPickerProps): void {
		if(newProps.from != this.props.from || newProps.to != this.props.to || newProps.locale != this.props.locale) {
			this.setState({ value: this.composeValue(newProps.from, newProps.to, newProps.locale )});
		}
	}

	public render(): JSX.Element {
		let { from, to, onChange, placeholder, minFrom, maxTo, translator, locale } = this.props;
		let dropdownProps = buildFrom(this.props).without({ from, to, onChange, placeholder, minFrom, maxTo, translator, locale }).result as DropdownBaseProps;

		return (
			<Dropdown {...dropdownProps} open={this.state.open} onToggle={this.onToggle}>
				<ToggleButton
					bsRole="toggle"
				>
					{this.renderPlaceholder()}
				</ToggleButton>
				<PeriodPickerDropdown
					bsRole="menu"
					translator={translator}
					locale={locale}
					overallFromDate={minFrom}
					overallToDate={maxTo}
					onChoose={this.onChange}
					onCancel={this.onCancel}
					initialValue={this.state.value}
				/>
			</Dropdown>
		);
	}

	private onToggle = (open: boolean): void => {
		this.setState({ open });
	}

	private onChange = (value: Moment | [Moment, Moment]): void => {
		let formatString = "YYYY-MM-DD";
		let from: string;
		let to: string;

		if(Array.isArray(value)) {
			from = value[0].format(formatString);
			to = value[1].format(formatString);
		} else {
			// noinspection TypeScriptUnresolvedFunction
			from = value.format(formatString);
			to = from;
		}

		if(this.props.onChange) {
			this.props.onChange(from, to);
		}

		this.setState({ open: false, value });
	}

	private onCancel = (): void => {
		this.setState({ open: false });
	}

	private composeValue(from: string, to: string, locale: string): Moment | [Moment, Moment] {
		if(from && to) {
			if(from == to) {
				return moment(from).locale(locale);
			} else {
				return [
					moment(from).locale(locale),
					moment(to).locale(locale)
				];
			}
		}

		return null;
	}

	private renderPlaceholder(): string {
		if(!this.state.value) {
			return this.props.placeholder;
		} else if(Array.isArray(this.state.value)) {
			return this.state.value[0].format("ll") + " - " + this.state.value[1].format("ll");
		} else {
			// noinspection TypeScriptUnresolvedFunction
			return this.state.value.format("LL");
		}
	}
}