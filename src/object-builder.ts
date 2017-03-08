/**
 * Object builder allows to build plain object by
 * composing multiple objects and returning a copy
 * without some arguments.
 *
 * The usage is a little more pretty than simply using
 * extend & filter and also provides a very good
 * typing support.
 */
import { omit } from "underscore";

class Builder<T1 extends Object> {
	constructor(public result: T1) { }

	public and<T2 extends Object>(value: T2): Builder<T1 & T2> {
		return new Builder<T1 & T2>(Object.assign(this.result, value));
	}

	public without(value): Builder<T1> {
		if("string" === typeof value) {
			value = [value];
		}

		if(Object.prototype.toString.call(value) as any !== "[object Array]") {
			value = Object.keys(value);
		}

		this.result = omit(this.result, value) as T1;
		return this;
	}
}

export function buildFrom<T extends Object>(value: T): Builder<T> {
	return new Builder(Object.assign({}, value));
}