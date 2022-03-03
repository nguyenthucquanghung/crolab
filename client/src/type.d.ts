import {CategoryType} from "./utils/enumerates";

export type Job = {
	accepted_qty: number;
	accepted_threshold: number;
	bonus_threshold: number;
	category: CategoryType;
	created_at: string;
	deadline: string;
	description: string;
	id: number;
	min_qty: number;
	name: string;
	requester: User;
	shared_qty: number;
	tasks: Task[];
	truth_qty: number;
	truth_qty_ready: boolean;
	truth_units: TruthUnit[];
	unit_bonus: number;
	unit_qty: number;
	unit_wage: number;
	updated_at: string;

}

export type Task = {
	id: number;
	annotator: User;
	unit_qty: number;
	labeled_unit: number;
	accepted: boolean;
	passed: boolean;
	rejected: boolean;
	is_submitted: boolean;
	created_at: string;
	accepted_at: string;
	shared_accuracy: number;
	truth_accuracy: number;
	job: Job;
	rated?: boolean;
	rating?: number;
}

export type TruthUnit = {
	id: number;
	job: number;
	data: string;
	label: string;
}

export type User = {
	id: number;
	full_name: string;
	email: string;
	created_at: string;
	updated_at: string;
	gender: number;
	year_of_birth: number;
	rating: number;
	role: number;
	task_c: number;
	mean_truth_accuracy: number;
	mean_shared_accuracy: number;
	label_c: number;
}

export type Unit = {
	id: number;
	job: number;
	task: number;
	data: string;
	label: string | null;
	assigned: boolean;
}