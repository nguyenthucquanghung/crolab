import API from "./api";
import {GenderType, UserRoleType} from "../utils/enumerates";

class UserAPI {
	register = (
		pEmail: string,
		pName: string,
		pPassword: string,
		pYOB: number,
		pGender: GenderType,
		pRole: UserRoleType
	) => {
		const url = '/auth/register';
		return API.post(url, {
			email: pEmail,
			password: pPassword,
			full_name: pName,
			year_of_birth: pYOB,
			role: pRole,
			gender: pGender,
		});
	}
	login = (pEmail: string, pPassword: string) => {
		const url = '/auth/login';
		return API.post(url, {email: pEmail, password: pPassword});
	}
	getAllUsers = () => {
		const url = "/user"
		return API.get(url);
	}
}

const userAPI = new UserAPI();
export default userAPI;