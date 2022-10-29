export class AppError extends Error {
	status: number;

	constructor(message, status) {
		super()
		this.message = message;
		this.status = status
	}
}