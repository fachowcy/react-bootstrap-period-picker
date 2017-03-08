import * as React from "react";

export interface IDropdownLinkProps {
	option: string;

	onMouseEnter(option: string): void;
	onClick(option: string): void;
}

export class DropdownLink extends React.PureComponent<IDropdownLinkProps, {}> {
	private highlightTimeout: any = null;

	public render(): JSX.Element {
		return (
			<li>
				<a onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.onClick}>{this.props.children}</a>
			</li>
		);
	}

	private onMouseEnter = (): void => {
		this.highlightTimeout = setTimeout(() => {
			this.highlightTimeout = null;
			this.props.onMouseEnter(this.props.option);
		}, 120);
	}

	private onMouseLeave = (): void => {
		if(null !== this.highlightTimeout) {
			clearTimeout(this.highlightTimeout);
			this.highlightTimeout = null;
		}
	}

	private onClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
		e.stopPropagation();
		this.props.onClick(this.props.option);
	}
}