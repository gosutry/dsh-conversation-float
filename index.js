/**
 * Host half of the session-window bundle.
 *
 * The window lives entirely in the browser surface: the Client half lifts the
 * live Conversation column into an in-app floating window and hides nothing
 * else, so there is no Host work to do. This half exists because a bundle row
 * needs a Host module; it registers nothing.
 */
export function apply() {}
