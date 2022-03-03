import API from "./api";
import {Unit} from "../type";

class TaskAPI {
	create = (jobId: number, qty: number) => {
		const url = `/task/`
		return API.post(url, {job: jobId, unit_qty: qty});
	}

	accept = (taskId: number) => {
		const url = `/task/${taskId}/accept_task/`;
		return API.put(url);
	}

	reject = (taskId: number) => {
		const url = `/task/${taskId}/reject_task/`;
		return API.put(url);
	}

	getAllTasks = () => {
		const url = `/task/`;
		return API.get(url);
	}

	getTaskById = (taskId: number | string, page: number | string) => {
		const url = `/task/${taskId}/?page=${page}`;
		return API.get(url);
	}

	submitLabel = (taskId: number | string, units: Unit[]) => {
		const url = `/task/${taskId}/submit_label/`;
		return API.put(url, {
			units: units.map(u => {
				return {unit_id: u.id, label: u.label}
			})
		})
	}

	finishTask = (taskId: number | string) => {
		const url = `/task/${taskId}/submit/`;
		return API.put(url);
	}

	setTaskPassed = (taskId: number | string) => {
		const url = `/task/${taskId}/set_task_passed/`;
		return API.put(url);
	}

	rate = (taskId: number|string, rating: number, comment: string) => {
		const url = `/rate/`;
		return API.post(url, {
			task: taskId,
			rating: rating,
			comment: comment
		})
	}
}

const taskAPI = new TaskAPI();
export default taskAPI;